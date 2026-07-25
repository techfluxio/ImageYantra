/**
 * adminApi.js
 * Thin wrapper around Supabase (auth + table CRUD) for the admin panel.
 * Every exported function keeps the same name/shape the admin screens
 * already call, so AdminTools.jsx/AdminBlog.jsx/AdminAds.jsx etc. barely
 * had to change — only what's *inside* each function changed.
 */
import { supabase } from '../lib/supabaseClient.js';

const EDGE_FN_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : '';

function unwrap({ data, error }) {
  if (error) throw new Error(error.message || 'Request failed');
  return data;
}

export const adminApi = {
  // ── Auth ──────────────────────────────────────────────
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message || 'Login failed');
    return { token: data.session?.access_token };
  },
  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw new Error('Not signed in');
    return data.user;
  },
  async logout() {
    await supabase.auth.signOut();
  },

  // ── Categories ────────────────────────────────────────
  listCategories: () => supabase.from('categories').select('*').order('sort_order').then(unwrap),
  createCategory: (cat) => supabase.from('categories').insert(cat).select().single().then(unwrap),
  updateCategory: (id, patch) => supabase.from('categories').update(patch).eq('id', id).select().single().then(unwrap),
  deleteCategory: (id) => supabase.from('categories').delete().eq('id', id).then(unwrap),
  reorderCategories: (order /* [{id, sort_order}] */) =>
    Promise.all(order.map((o) => supabase.from('categories').update({ sort_order: o.sort_order }).eq('id', o.id))),

  // ── Tools ─────────────────────────────────────────────
  listTools: () => supabase.from('tools').select('*').order('sort_order').then(unwrap),
  createTool: (tool) => supabase.from('tools').insert(tool).select().single().then(unwrap),
  updateTool: (id, patch) => supabase.from('tools').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single().then(unwrap),
  deleteTool: (id) => supabase.from('tools').delete().eq('id', id).then(unwrap),
  reorderTools: (order /* [{id, sort_order}] */) =>
    Promise.all(order.map((o) => supabase.from('tools').update({ sort_order: o.sort_order }).eq('id', o.id))),

  // ── Blog ──────────────────────────────────────────────
  listBlogPosts: () => supabase.from('blog_posts').select('*').order('date', { ascending: false }).then(unwrap),
  getBlogPost: (id) => supabase.from('blog_posts').select('*').eq('id', id).single().then(unwrap),
  createBlogPost: (post) => supabase.from('blog_posts').insert(post).select().single().then(unwrap),
  updateBlogPost: (id, patch) => supabase.from('blog_posts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single().then(unwrap),
  deleteBlogPost: (id) => supabase.from('blog_posts').delete().eq('id', id).then(unwrap),

  // ── Footer ────────────────────────────────────────────
  listFooterLinks: () => supabase.from('footer_links').select('*').order('group_sort').order('sort_order').then(unwrap),
  createFooterLink: (link) => supabase.from('footer_links').insert(link).select().single().then(unwrap),
  updateFooterLink: (id, patch) => supabase.from('footer_links').update(patch).eq('id', id).select().single().then(unwrap),
  deleteFooterLink: (id) => supabase.from('footer_links').delete().eq('id', id).then(unwrap),

  // ── Ads ───────────────────────────────────────────────
  listAds: () => supabase.from('ad_placements').select('*').then(unwrap),
  updateAd: (id, patch) => supabase.from('ad_placements').update(patch).eq('id', id).select().single().then(unwrap),
  createAd: (ad) => supabase.from('ad_placements').insert(ad).select().single().then(unwrap),
  deleteAd: (id) => supabase.from('ad_placements').delete().eq('id', id).then(unwrap),

  // ── Analytics (page views) ───────────────────────────
  async analyticsSummary(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabase
      .from('page_views')
      .select('path, tool_slug, device_type, referrer_host, session_id, created_at')
      .gte('created_at', since);
    if (error) throw new Error(error.message);

    const totalViews = data.length;
    const sessions = new Set();
    const byDay = {};
    const byMonth = {};
    const byPath = {};
    const byTool = {};
    const byReferrer = {};
    const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 };

    for (const row of data) {
      const day = row.created_at.slice(0, 10);
      const month = row.created_at.slice(0, 7);
      byDay[day] = (byDay[day] || 0) + 1;
      byMonth[month] = (byMonth[month] || 0) + 1;
      byPath[row.path] = (byPath[row.path] || 0) + 1;
      if (row.tool_slug) byTool[row.tool_slug] = (byTool[row.tool_slug] || 0) + 1;
      if (row.session_id) sessions.add(row.session_id);
      if (row.device_type && deviceBreakdown[row.device_type] !== undefined) {
        deviceBreakdown[row.device_type] += 1;
      }
      if (row.referrer_host) byReferrer[row.referrer_host] = (byReferrer[row.referrer_host] || 0) + 1;
    }

    return {
      rangeDays: days,
      totalViews,
      uniqueSessions: sessions.size,
      deviceBreakdown,
      viewsByDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, views]) => ({ date, views })),
      viewsByMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, views]) => ({ month, views })),
      topPages: Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, views]) => ({ path, views })),
      topTools: Object.entries(byTool).sort((a, b) => b[1] - a[1]).map(([tool, views]) => ({ tool, views })),
      topReferrers: Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([host, views]) => ({ host, views })),
    };
  },

  // ── Error / glitch reports ────────────────────────────
  async listErrorReports(days = 14) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabase
      .from('error_reports')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data;
  },
  deleteErrorReport: (id) => supabase.from('error_reports').delete().eq('id', id).then(unwrap),

  // ── Upload-a-tool (GitHub commit + rebuild) — the only call that goes
  //    through an Edge Function, since it needs a server-side GitHub
  //    token/deploy-hook secret that must never reach the browser. ──
  async uploadToolCode({ slug, name, categorySlug, componentSource, fileName }) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Not signed in');

    const res = await fetch(`${EDGE_FN_BASE}/upload-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug, name, categorySlug, componentSource, fileName }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);
    return json;
  },
};
