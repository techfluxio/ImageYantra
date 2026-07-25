import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const SESSION_KEY = 'iy_session_id';

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getDeviceType() {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getToolSlug(pathname) {
  const m = pathname.match(/^\/tools\/([^/]+)/);
  return m ? m[1] : null;
}

function getReferrerHost() {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return null;
  }
}

/** Fires a lightweight, privacy-friendly page-view beacon on every
 *  route change straight into the `page_views` table (anon insert-only
 *  per RLS). Silently no-ops if Supabase isn't configured/reachable —
 *  never blocks or slows down navigation. */
export function useAnalyticsBeacon() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return; // don't track the admin panel itself
    if (!isSupabaseConfigured) return;

    supabase.from('page_views').insert({
      path: location.pathname,
      tool_slug: getToolSlug(location.pathname),
      referrer_host: getReferrerHost(),
      session_id: getSessionId(),
      device_type: getDeviceType(),
    }).then(() => {}, () => {}); // fire-and-forget, never surfaces errors to the user
  }, [location.pathname]);
}
