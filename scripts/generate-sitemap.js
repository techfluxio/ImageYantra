/**
 * Generates public/sitemap.xml from the same tool/blog data used for
 * routing, so it's always in sync with what actually exists — no more
 * manually-maintained, stale URLs. Runs automatically before every build
 * (see package.json "prebuild").
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SITE = 'https://imageyantra.in';

async function main() {
  // Load data via a quick esbuild-free trick: dynamic import works fine
  // for plain ESM data files with no JSX.
  const { IMAGE_TOOLS } = await import('../src/data/imageTools.js');
  const { PDF_TOOLS } = await import('../src/data/pdfTools.js');
  const { GOVT_TOOLS, BLOG_POSTS } = await import('../src/data/index.js');
  const { SOCIAL_TOOLS } = await import('../src/data/socialTools.js');
  const { OTHER_TOOLS } = await import('../src/data/otherTools.js');
  const { EXAM_TOOLS } = await import('../src/data/examTools.js');
  // Written just before this script runs, by scripts/fetch-live-content.js
  // (see package.json "prebuild") — empty arrays if Supabase isn't set up.
  const live = await import('../src/data/generated/live.json', { with: { type: 'json' } })
    .then((m) => m.default)
    .catch(() => ({ categories: [], tools: [], blogPosts: [] }));

  const toolSlugs = Array.from(
    new Set(
      [...IMAGE_TOOLS, ...PDF_TOOLS, ...GOVT_TOOLS, ...SOCIAL_TOOLS, ...OTHER_TOOLS, ...EXAM_TOOLS, ...live.tools]
        .map((t) => t.slug)
        .filter(Boolean),
    ),
  );
  const blogSlugs = Array.from(
    new Set([...BLOG_POSTS, ...live.blogPosts].map((p) => p.slug).filter(Boolean)),
  );
  const staticCategorySlugs = ['image-tools', 'pdf-tools', 'exam-tools', 'id-photo-sizes', 'social-tools', 'other-tools'];
  const extraCategorySlugs = (live.categories || [])
    .map((c) => c.slug)
    .filter((slug) => slug && !staticCategorySlugs.includes(slug));

  const urls = [
    { loc: '/', priority: '1.0', freq: 'weekly' },
    { loc: '/image-tools', priority: '0.9', freq: 'weekly' },
    { loc: '/pdf-tools', priority: '0.9', freq: 'weekly' },
    { loc: '/exam-tools', priority: '0.9', freq: 'weekly' },
    { loc: '/id-photo-sizes', priority: '0.8', freq: 'weekly' },
    { loc: '/social-tools', priority: '0.8', freq: 'weekly' },
    { loc: '/other-tools', priority: '0.8', freq: 'weekly' },
    ...extraCategorySlugs.map((slug) => ({ loc: `/${slug}`, priority: '0.8', freq: 'weekly' })),
    ...toolSlugs.map((slug) => ({ loc: `/tools/${slug}`, priority: '0.9', freq: 'monthly' })),
    { loc: '/blog', priority: '0.8', freq: 'weekly' },
    ...blogSlugs.map((slug) => ({ loc: `/blog/${slug}`, priority: '0.6', freq: 'monthly' })),
    { loc: '/about', priority: '0.5', freq: 'monthly' },
    { loc: '/privacy', priority: '0.4', freq: 'monthly' },
    { loc: '/terms', priority: '0.4', freq: 'monthly' },
    { loc: '/disclaimer', priority: '0.4', freq: 'monthly' },
  ];

  const body = urls
    .map((u) => `  <url><loc>${SITE}${u.loc}</loc><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml);
  console.log(`[sitemap] wrote ${urls.length} URLs to public/sitemap.xml`);
}

main();
