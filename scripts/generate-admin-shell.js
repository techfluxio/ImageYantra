/**
 * generate-admin-shell.js
 *
 * The admin panel is intentionally excluded from static prerendering
 * (see vite.config.js ssgOptions.includedRoutes) since it's behind login
 * and has no SEO value. That's fine for client-side navigation *within*
 * the app — but a hard refresh or direct link to e.g. /admin/dashboard
 * has no matching prerendered file, so the host falls back to serving
 * the homepage's prerendered dist/index.html instead.
 *
 * vite-react-ssg's client runtime always calls React's hydrateRoot() in
 * production when it finds a `[data-server-rendered=true]` node — so it
 * ends up trying to hydrate the Admin Dashboard component tree on top of
 * homepage markup. That guaranteed structural mismatch is exactly what
 * produces the "Minified React error #418 / #423" hydration errors in
 * the admin console.
 *
 * Fix: after the SSG build, derive a clean shell from the real
 * dist/index.html (same built JS/CSS asset tags, so nothing goes stale)
 * but with the prerendered content stripped out and the
 * data-server-rendered marker removed, and write it to dist/admin/index.html.
 * vercel.json then routes /admin/* to this shell instead of the homepage
 * file, so the client does a plain, mismatch-free client render there.
 *
 * Runs automatically after every build (see package.json "postbuild").
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distIndexPath = path.join(root, 'dist', 'index.html');
const adminDir = path.join(root, 'dist', 'admin');
const adminShellPath = path.join(adminDir, 'index.html');

function stripPrerenderedRoot(html) {
  const marker = '<div id="root"';
  const startIdx = html.indexOf(marker);
  if (startIdx === -1) {
    console.warn('[admin-shell] Could not find <div id="root" in dist/index.html — leaving admin shell as a straight copy.');
    return html;
  }

  const openTagEnd = html.indexOf('>', startIdx);
  if (openTagEnd === -1) return html;

  // Walk forward from just after the opening <div id="root" ...> tag,
  // tracking nesting depth so we find the *matching* closing </div> even
  // though the prerendered homepage is full of nested <div>s.
  let depth = 1;
  let cursor = openTagEnd + 1;
  const tagRe = /<div\b[^>]*>|<\/div>/gi;
  tagRe.lastIndex = cursor;
  let match;
  let closeStart = -1;
  let closeEnd = -1;
  while ((match = tagRe.exec(html)) !== null) {
    if (match[0].toLowerCase() === '</div>') {
      depth -= 1;
      if (depth === 0) {
        closeStart = match.index;
        closeEnd = tagRe.lastIndex;
        break;
      }
    } else {
      depth += 1;
    }
  }

  if (closeStart === -1) {
    console.warn('[admin-shell] Could not find matching </div> for #root — leaving admin shell as a straight copy.');
    return html;
  }

  const openTag = html
    .slice(startIdx, openTagEnd + 1)
    // Drop the hydration marker vite-react-ssg adds — without it, the
    // client runtime's own `isSSR` check treats this as an unrendered
    // shell instead of something to hydrate against.
    .replace(/\s+data-server-rendered=["']?true["']?/i, '');

  return html.slice(0, startIdx) + openTag + '</div>' + html.slice(closeEnd);
}

async function main() {
  if (!fs.existsSync(distIndexPath)) {
    console.warn('[admin-shell] dist/index.html not found — skipping (did the build run?).');
    return;
  }

  const html = fs.readFileSync(distIndexPath, 'utf8');
  const shell = stripPrerenderedRoot(html);

  fs.mkdirSync(adminDir, { recursive: true });
  fs.writeFileSync(adminShellPath, shell, 'utf8');
  console.log('[admin-shell] wrote dist/admin/index.html');
}

main();