/**
 * errorReporting.js
 * Lightweight "glitch" capture — records tool slug, a short error message,
 * browser (User-Agent) and device type so the dashboard can surface
 * patterns like "Background Remove keeps failing on Safari". Deliberately
 * captures NOTHING else: no file contents, no filenames, no personal data.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

function getDeviceType() {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function toolSlugFromPath(pathname) {
  const m = pathname.match(/^\/tools\/([^/]+)/);
  return m ? m[1] : 'unknown';
}

/**
 * Call this from a tool page's catch block when processing fails, e.g.:
 *   try { await compressToTarget(...) }
 *   catch (err) { reportToolError('compress-image', err); setError(...); }
 *
 * Safe to call anywhere — never throws, never blocks the UI.
 */
export function reportToolError(toolSlug, error) {
  if (!isSupabaseConfigured) return;
  const message = String(error?.message || error || 'Unknown error').slice(0, 300);
  supabase.from('error_reports').insert({
    tool_slug: toolSlug,
    message,
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
  }).then(() => {}, () => {});
}

/**
 * Installed once in main.jsx. Catches otherwise-uncaught exceptions and
 * unhandled promise rejections anywhere on a /tools/:slug page — this is
 * the safety net that covers every tool automatically without needing a
 * reportToolError() call added to each one individually. Explicit calls
 * (above) are still worth adding for *handled* failures (e.g. "unsupported
 * format") that show a friendly message instead of throwing.
 */
export function installGlobalGlitchCapture() {
  if (!isSupabaseConfigured) return;

  function handle(message, error) {
    if (!window.location.pathname.startsWith('/tools/')) return;
    reportToolError(toolSlugFromPath(window.location.pathname), error || message);
  }

  window.addEventListener('error', (e) => handle(e.message, e.error));
  window.addEventListener('unhandledrejection', (e) => handle(String(e.reason), e.reason));
}
