/**
 * supabaseClient.js
 * One shared Supabase client for the whole app — public site pages use it
 * (anon key, read-only per RLS) and the admin panel reuses the same
 * instance once signed in (RLS then allows writes for the authenticated
 * admin user).
 *
 * Requires two env vars (see .env.example):
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...   (the *anon* public key — never the
 *   service_role key, which must never be shipped to the browser)
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// During the static-site build step (Node, no env yet configured) or in
// local dev before .env is filled in, fall back to a harmless no-op-ish
// client pointing nowhere — every call site already treats a failed/empty
// response as "backend unavailable, use bundled static data", so this
// never crashes the build or the page.
export const supabase = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

export const isSupabaseConfigured = Boolean(url && anonKey);
