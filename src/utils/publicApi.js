/**
 * publicApi.js
 * Fetches live data (tools, categories, blog posts, ad slots, footer links)
 * from Supabase so admin edits show up on the site without a redeploy.
 *
 * Every function here returns null if Supabase isn't reachable/configured
 * or the query fails — callers fall back to the bundled static data
 * (data/imageTools.js, data/index.js, etc.), so the site never breaks
 * just because the backend is down or hasn't been set up yet.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

async function safeQuery(builder) {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await builder;
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchLiveCategories() {
  return safeQuery(supabase.from('categories').select('*').order('sort_order'));
}

export async function fetchLiveTools() {
  return safeQuery(
    supabase.from('tools').select('*').eq('active', true).order('sort_order'),
  );
}

export async function fetchLiveBlogPosts() {
  return safeQuery(
    supabase.from('blog_posts').select('*').eq('published', true).order('date', { ascending: false }),
  );
}

export async function fetchLiveBlogPost(slug) {
  const rows = await safeQuery(
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).limit(1),
  );
  return rows && rows.length ? rows[0] : null;
}

export async function fetchLiveFooterLinks() {
  return safeQuery(supabase.from('footer_links').select('*').order('group_sort').order('sort_order'));
}

export async function fetchSiteSettings() {
  const rows = await safeQuery(supabase.from('site_settings').select('*').limit(1));
  return rows && rows.length ? rows[0] : null;
}

export async function fetchLivePage(slug) {
  const rows = await safeQuery(supabase.from('pages').select('*').eq('slug', slug).limit(1));
  return rows && rows.length ? rows[0] : null;
}

export async function fetchLiveAds() {
  return safeQuery(supabase.from('ad_placements').select('*'));
}

/** Look up a single ad slot by placement name from a fetched ads array. */
/** Supabase blog_post rows use snake_case (read_time) and don't have a
 *  pre-computed dateISO — normalize to what the static bundled data (and
 *  every page that renders posts) already expects. */
export function normalizeBlogPost(row) {
  return {
    ...row,
    readTime: row.readTime ?? row.read_time ?? 4,
    dateISO: row.dateISO || row.date || row.created_at || null,
    date: row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
  };
}

export function findAdSlot(adsArray, placement, fallbackSlot) {
  if (!adsArray) return { slot: fallbackSlot, enabled: true };
  const match = adsArray.find((a) => a.placement === placement);
  if (!match) return { slot: fallbackSlot, enabled: true };
  return { slot: match.slot || fallbackSlot, enabled: match.enabled !== false };
}

/**
 * Merge a bundled static list with live overrides from Supabase.
 * - Static entries are kept as the base (so nothing disappears if the
 *   backend is briefly unreachable).
 * - Live rows with a matching slug override the static entry's fields.
 * - Live rows with a slug not in the static list are appended (this is
 *   how brand-new admin-created tools/categories show up immediately).
 * - Live rows with active === false are removed entirely.
 */
export function mergeBySlug(staticList, liveList, slugKey = 'slug') {
  if (!liveList) return staticList;
  const bySlug = new Map(staticList.map((item) => [item[slugKey], { ...item }]));
  for (const row of liveList) {
    const slug = row[slugKey];
    if (!slug) continue;
    if (row.active === false) {
      bySlug.delete(slug);
      continue;
    }
    bySlug.set(slug, { ...bySlug.get(slug), ...row });
  }
  return Array.from(bySlug.values());
}