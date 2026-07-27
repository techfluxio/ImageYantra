/**
 * completionTracking.js
 * Records a successful tool conversion — no file content, just tool
 * slug, how many files were processed, and how long it took (from
 * file-select to result shown). Wired into ToolShell.jsx once, which
 * covers nearly every file-based tool site-wide.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

function toolSlugFromPath(pathname) {
  const m = pathname.match(/^\/tools\/([^/]+)/);
  return m ? m[1] : null;
}

export function reportToolCompletion({ filesCount = 1, durationMs = null } = {}) {
  if (!isSupabaseConfigured) return;
  const slug = toolSlugFromPath(window.location.pathname);
  if (!slug) return;
  supabase.from('tool_completions').insert({
    tool_slug: slug,
    files_count: filesCount,
    duration_ms: durationMs,
  }).then(() => {}, () => {});
}