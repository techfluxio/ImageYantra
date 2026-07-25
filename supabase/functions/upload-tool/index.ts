// supabase/functions/upload-tool/index.ts
//
// Deploy with:  supabase functions deploy upload-tool
// Requires these Edge Function secrets (Supabase Dashboard → Project
// Settings → Edge Functions → Secrets, or `supabase secrets set`):
//
//   GITHUB_TOKEN        — a fine-grained GitHub PAT with "Contents: Read
//                          and write" access to ONLY this one repo.
//   GITHUB_REPO         — "your-username/imageyantra-frontend"
//   GITHUB_BRANCH       — "main" (or a staging branch — see SETUP.md)
//   VERCEL_DEPLOY_HOOK  — the Deploy Hook URL from Vercel → Project
//                          Settings → Git → Deploy Hooks
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set automatically by
//                          Supabase for every Edge Function, used here
//                          to verify the caller's JWT and upsert the
//                          tools row with elevated privileges.
//
// This is the ONLY part of the whole admin system that runs as a real
// server-side function — everything else talks to Supabase directly
// from the browser — because committing to GitHub and triggering a
// deploy both need secrets that must never reach client-side code.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')!;
const GITHUB_REPO = Deno.env.get('GITHUB_REPO')!; // "owner/repo"
const GITHUB_BRANCH = Deno.env.get('GITHUB_BRANCH') || 'main';
const VERCEL_DEPLOY_HOOK = Deno.env.get('VERCEL_DEPLOY_HOOK')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/** Very light sanity check on the uploaded source — this is NOT a
 *  security sandbox (the code still runs in the visitor's browser once
 *  built, same as every other tool page), it just catches obviously
 *  wrong uploads (empty file, no default export) before committing. */
function validateComponentSource(source: string) {
  if (!source || source.trim().length < 20) return 'File is empty or too short to be a real component.';
  if (!/export\s+default/.test(source)) return "File must have a default export (e.g. `export default function MyToolPage() { ... }`).";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // ── 1. Verify the caller is a signed-in admin ──────────────────────
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return json({ error: 'Not signed in' }, 401);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) return json({ error: 'Not signed in' }, 401);

  // ── 2. Validate input ───────────────────────────────────────────────
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const { slug, name, categorySlug, componentSource, fileName } = body;
  if (!slug || !name || !componentSource || !fileName) {
    return json({ error: 'Missing slug, name, componentSource, or fileName' }, 400);
  }
  if (!/^[a-z0-9-]+$/.test(slug)) return json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, 400);
  if (!/^[A-Za-z0-9]+\.jsx$/.test(fileName)) return json({ error: 'fileName must look like MyToolPage.jsx' }, 400);

  const sourceError = validateComponentSource(componentSource);
  if (sourceError) return json({ error: sourceError }, 400);

  const repoPath = `src/pages/tools/${fileName}`;

  try {
    // ── 3. Commit the file via GitHub's Contents API ─────────────────
    // Check if the file already exists (need its SHA to update vs. create).
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } },
    );
    const existingSha = getRes.ok ? (await getRes.json()).sha : undefined;

    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add tool "${name}" via admin panel (${slug})`,
          content: btoa(unescape(encodeURIComponent(componentSource))),
          branch: GITHUB_BRANCH,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      },
    );
    if (!putRes.ok) {
      const errBody = await putRes.text();
      return json({ error: `GitHub commit failed: ${putRes.status} ${errBody}` }, 502);
    }

    // ── 4. Upsert the tools row so ToolPage.jsx knows to look for it ──
    const { error: upsertError } = await supabase.from('tools').upsert(
      {
        slug,
        name,
        category_slug: categorySlug || null,
        component_path: fileName,
        build_status: 'pending_build',
        active: true,
      },
      { onConflict: 'slug' },
    );
    if (upsertError) return json({ error: `Committed to GitHub but failed to save tool record: ${upsertError.message}` }, 500);

    // ── 5. Trigger the rebuild ─────────────────────────────────────────
    if (VERCEL_DEPLOY_HOOK) {
      await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' }).catch(() => {});
    }

    return json({ ok: true, path: repoPath, branch: GITHUB_BRANCH });
  } catch (err) {
    return json({ error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` }, 500);
  }
});
