// supabase/functions/deploy-webhook/index.ts
//
// Configure Vercel to call this URL on every successful deployment:
//   Project Settings → Git → Deploy Hooks doesn't support this direction,
//   so instead use Vercel's native "Webhooks" feature (Account/Team
//   Settings → Webhooks → Add Webhook, event: "deployment.succeeded",
//   pointed at this function's URL). This is optional — if you skip it,
//   everything still works, the admin Tools screen will just keep
//   showing "Building…" for a tool even after it's actually live, since
//   nothing tells it the build finished.
//
// No secrets are trusted here beyond a shared-secret query param you set
// yourself, since Vercel's webhook payloads aren't signed in a way this
// lightweight setup verifies cryptographically. Set DEPLOY_WEBHOOK_SECRET
// as an Edge Function secret and put the same value in the webhook URL
// as ?secret=... when configuring it in Vercel.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DEPLOY_WEBHOOK_SECRET = Deno.env.get('DEPLOY_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (DEPLOY_WEBHOOK_SECRET && url.searchParams.get('secret') !== DEPLOY_WEBHOOK_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await supabase.from('tools').update({ build_status: 'live' }).eq('build_status', 'pending_build');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
