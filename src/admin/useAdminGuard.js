import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi.js';

const IDLE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_POLL_MS = 20 * 1000;    // check for "signed in elsewhere" every 20s
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

/**
 * Guards every admin route for three things at once:
 *
 * 1. Back/forward button showing a stale page after logout — a browser
 *    can restore a page from bfcache (a literal snapshot) without
 *    re-running any React code, so a `useEffect` auth check on mount
 *    never re-fires when you hit "back" into the dashboard after
 *    logging out. Listening for `pageshow` with `event.persisted`
 *    catches exactly that restore and re-validates immediately.
 *
 * 2. Only one active login at a time — adminApi.login() claims a fresh
 *    session id in Supabase; this hook polls whether *this* tab's id is
 *    still the current one, and signs out the moment it isn't (meaning
 *    someone logged in elsewhere).
 *
 * 3. Auto sign-out after 10 minutes with no mouse/keyboard/touch
 *    activity anywhere on the page.
 */
export function useAdminGuard() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const idleTimer = useRef(null);

  function signOutWithReason(reason) {
    adminApi.logout().finally(() => {
      navigate('/admin/login', { replace: true, state: { reason } });
    });
  }

  async function validate() {
    try {
      await adminApi.me();
    } catch {
      navigate('/admin/login', { replace: true });
      return false;
    }
    const active = await adminApi.isSessionStillActive();
    if (!active) {
      signOutWithReason('You were signed out because your account was signed in on another device.');
      return false;
    }
    return true;
  }

  useEffect(() => {
    let cancelled = false;
    validate().then((ok) => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  // 1. Re-validate whenever the page is restored from bfcache (browser
  //    back/forward), not just on first mount.
  useEffect(() => {
    function onPageShow(e) {
      if (e.persisted) validate();
    }
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // 2. Poll for "signed in elsewhere" periodically while this tab is open.
  useEffect(() => {
    const interval = setInterval(async () => {
      const active = await adminApi.isSessionStillActive();
      if (!active) {
        signOutWithReason('You were signed out because your account was signed in on another device.');
      }
    }, SESSION_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  // 3. Idle timeout — any real user activity resets the 10-minute clock.
  useEffect(() => {
    function resetIdleTimer() {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        signOutWithReason("You were signed out after 10 minutes of inactivity.");
      }, IDLE_LIMIT_MS);
    }
    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    return () => {
      clearTimeout(idleTimer.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, []);

  return { checking };
}