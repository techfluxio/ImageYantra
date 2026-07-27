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

function browserFromUA(ua = '') {
  if (!ua) return 'Other';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Other';
}

const SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 't.co', 'linkedin.com', 'pinterest.com', 'reddit.com', 'wa.me', 'whatsapp.com'];
const SEARCH_HOSTS = ['google.', 'bing.com', 'yahoo.', 'duckduckgo.com'];

function trafficSourceFromReferrer(host) {
  if (!host) return 'Direct';
  const h = host.toLowerCase();
  if (SEARCH_HOSTS.some((s) => h.includes(s))) return 'Google Search';
  if (SOCIAL_HOSTS.some((s) => h.includes(s))) return 'Social Media';
  return 'Referral';
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
      .select('path, tool_slug, device_type, referrer_host, session_id, user_agent, created_at')
      .gte('created_at', since);
    if (error) throw new Error(error.message);

    const totalViews = data.length;
    const sessions = new Set();
    const byDay = {};
    const byMonth = {};
    const byPath = {};
    const byTool = {};
    const byReferrer = {};
    const byBrowser = {};
    const byTrafficSource = { 'Google Search': 0, 'Direct': 0, 'Social Media': 0, 'Referral': 0 };
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

      const browser = browserFromUA(row.user_agent);
      byBrowser[browser] = (byBrowser[browser] || 0) + 1;

      byTrafficSource[trafficSourceFromReferrer(row.referrer_host)] += 1;
    }

    return {
      rangeDays: days,
      totalViews,
      uniqueSessions: sessions.size,
      deviceBreakdown,
      browserBreakdown: Object.entries(byBrowser).sort((a, b) => b[1] - a[1]).map(([browser, views]) => ({ browser, views })),
      trafficSources: Object.entries(byTrafficSource).map(([source, views]) => ({ source, views })).filter((s) => s.views > 0),
      viewsByDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, views]) => ({ date, views })),
      viewsByMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, views]) => ({ month, views })),
      topPages: Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, views]) => ({ path, views })),
      topTools: Object.entries(byTool).sort((a, b) => b[1] - a[1]).map(([tool, views]) => ({ tool, views })),
      topReferrers: Object.entries(byReferrer).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([host, views]) => ({ host, views })),
    };
  },

  // ── Tool health / completions ──────────────────────────
  async toolStats(days = 30) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const [{ data: completions, error: e1 }, { data: errors, error: e2 }] = await Promise.all([
      supabase.from('tool_completions').select('tool_slug, files_count, duration_ms, created_at').gte('created_at', since),
      supabase.from('error_reports').select('tool_slug, created_at').gte('created_at', since),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);

    const filesProcessed = completions.reduce((sum, c) => sum + (c.files_count || 1), 0);
    const durations = completions.map((c) => c.duration_ms).filter((d) => typeof d === 'number' && d > 0);
    const avgDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

    const errorsByTool = {};
    for (const e of errors) errorsByTool[e.tool_slug] = (errorsByTool[e.tool_slug] || 0) + 1;

    const completionsByTool = {};
    for (const c of completions) completionsByTool[c.tool_slug] = (completionsByTool[c.tool_slug] || 0) + 1;

    const allToolSlugs = new Set([...Object.keys(completionsByTool), ...Object.keys(errorsByTool)]);
    const perTool = Array.from(allToolSlugs).map((slug) => {
      const ok = completionsByTool[slug] || 0;
      const fail = errorsByTool[slug] || 0;
      const total = ok + fail;
      const successRate = total > 0 ? Math.round((ok / total) * 100) : null;
      let status = 'Healthy';
      if (successRate !== null && successRate < 70) status = 'Degraded';
      if (successRate !== null && successRate < 40) status = 'Failing';
      return { tool: slug, completions: ok, errors: fail, successRate, status };
    }).sort((a, b) => b.completions - a.completions);

    const totalOk = completions.length;
    const totalFail = errors.length;
    const overallTotal = totalOk + totalFail;
    const successRate = overallTotal > 0 ? Math.round((totalOk / overallTotal) * 100) : null;

    return { rangeDays: days, filesProcessed, avgDurationMs, successRate, perTool };
  },

  // ── Website settings ──────────────────────────────────
  async getSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
    if (error) throw new Error(error.message);
    return data;
  },
  updateSettings: (id, patch) => supabase.from('site_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single().then(unwrap),

  // ── Pages (About / Privacy / Terms / Disclaimer) ──────
  listPages: () => supabase.from('pages').select('*').order('slug').then(unwrap),
  updatePage: (id, patch) => supabase.from('pages').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single().then(unwrap),

  // ── Backup & Restore ───────────────────────────────────
  async exportAllData() {
    const tables = ['categories', 'tools', 'blog_posts', 'footer_links', 'ad_placements', 'site_settings', 'pages'];
    const result = {};
    for (const t of tables) {
      const { data, error } = await supabase.from(t).select('*');
      if (error) throw new Error(`Failed exporting ${t}: ${error.message}`);
      result[t] = data;
    }
    result._exportedAt = new Date().toISOString();
    return result;
  },
  async restoreData(backup) {
    const tables = ['categories', 'tools', 'blog_posts', 'footer_links', 'ad_placements', 'site_settings', 'pages'];
    for (const t of tables) {
      if (!Array.isArray(backup[t]) || !backup[t].length) continue;
      const { error } = await supabase.from(t).upsert(backup[t]);
      if (error) throw new Error(`Failed restoring ${t}: ${error.message}`);
    }
    return true;
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