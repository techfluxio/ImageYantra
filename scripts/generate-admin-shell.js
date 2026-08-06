/**
 * Admin routes (/admin/*) are deliberately excluded from static
 * generation (see vite.config.js ssgOptions.includedRoutes) — they're
 * behind a login, so there's nothing useful to prerender.
 *
 * Without this script, Vercel's catch-all rewrite (vercel.json) would
 * send any direct visit to /admin/login (or a refresh on any admin
 * page) to dist/index.html — which is the fully-rendered HOMEPAGE.
 * React would then try to hydrate the admin app on top of homepage
 * DOM, get a severe mismatch, throw hydration errors, and silently
 * discard + fully re-render client-side. It still ends up looking
 * correct, but only after doing broken, wasted work first.
 *
 * The fix: generate a genuinely empty shell (same scripts/styles, but
 * an empty #root and a neutral title) so the very first admin page
 * load is a normal client-side render, not a mismatched hydration.
 * vercel.json routes /admin/* here instead of the general catch-all.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');
const outPath = path.join(distDir, 'admin-shell.html');

if (!fs.existsSync(indexPath)) {
  console.warn('[generate-admin-shell] dist/index.html not found — skipping (did the main build run?).');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// Empty out the prerendered root content (homepage markup + the
// data-server-rendered flag) so the client does a plain render, not a
// hydrate-and-mismatch.
html = html.replace(/<div id="root"[^>]*>[\s\S]*?<\/div>\s*(?=<script)/, '<div id="root"></div>');

// Swap the homepage's title/description for a neutral one so an admin
// tab in the browser doesn't show "ImageYantra — Free Online..." while
// the real page is still loading.
html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/, '<title>ImageYantra Admin</title>');
html = html.replace(/<meta name="description"[^>]*>/, '<meta name="description" content="ImageYantra admin panel." />');

fs.writeFileSync(outPath, html);
console.log('[generate-admin-shell] Wrote dist/admin-shell.html');