/**
 * Runs before every build (see package.json "prebuild"). Snapshots the
 * current Supabase content into src/data/generated/live.json so that:
 *   - routes.jsx can generate a real static page for admin-created
 *     categories/tools/blog posts (getStaticPaths runs in this same
 *     Node build step and reads that file synchronously)
 *   - scripts/generate-sitemap.js includes those URLs too
 *
 * Never throws / never fails the build: if Supabase isn't configured yet,
 * or the project has no network access at build time, it just writes the
 * empty defaults and the site falls back to bundled static data + live
 * client-side fetches, exactly like every other safeFetch in this app.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'src/data/generated/live.json');

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  const empty = { categories: [], tools: [], blogPosts: [], fetchedAt: null };

  if (!url || !anonKey) {
    console.log('[fetch-live-content] VITE_SUPABASE_URL/ANON_KEY not set — skipping, using empty snapshot.');
    fs.writeFileSync(outPath, JSON.stringify(empty, null, 2));
    return;
  }

  try {
    const supabase = createClient(url, anonKey);
    const [{ data: categories }, { data: tools }, { data: blogPosts }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('tools').select('*').eq('active', true).order('sort_order'),
      supabase.from('blog_posts').select('*').eq('published', true),
    ]);

    fs.writeFileSync(
      outPath,
      JSON.stringify(
        { categories: categories || [], tools: tools || [], blogPosts: blogPosts || [], fetchedAt: new Date().toISOString() },
        null,
        2,
      ),
    );
    console.log(`[fetch-live-content] Snapshot written: ${categories?.length || 0} categories, ${tools?.length || 0} tools, ${blogPosts?.length || 0} posts.`);
  } catch (err) {
    console.warn('[fetch-live-content] Could not reach Supabase — using empty snapshot.', err.message);
    fs.writeFileSync(outPath, JSON.stringify(empty, null, 2));
  }
}

main();
