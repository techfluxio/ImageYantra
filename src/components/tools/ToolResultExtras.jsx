import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle, Newspaper } from 'lucide-react';
import { FAQAccordion } from '../ui/index.jsx';
import { AdBanner } from '../cards/index.jsx';
import { blogCategoryClass, getToolTone } from '../../utils/helpers.js';
import { fetchLiveBlogPosts, mergeBySlug, normalizeBlogPost } from '../../utils/publicApi.js';
import { BLOG_POSTS } from '../../data/index.js';

/**
 * Ad banner + Related Tools + Related Blogs + FAQ, meant to sit below
 * a tool's result section. Kept as a self-contained block so it can be
 * dropped under any ToolResult without touching the result layout itself.
 *
 * `tone` picks the category colour ('image'|'pdf'|'exam'|'govt'|'social'|'other')
 * so the Related Tools icons (and section accents) always match the
 * category the current tool page belongs to.
 *
 * `relatedBlogs` is only the SSG-safe initial fallback (usually
 * `BLOG_POSTS.slice(0, 3)` from whichever tool page renders this) — once
 * mounted, this component fetches the live, admin-managed blog list
 * itself and swaps in real posts, so every tool page's "Related Blogs"
 * section stays current without needing to touch each tool file.
 */
export default function ToolResultExtras({ relatedTools = [], relatedBlogs = [], faqs = [], tone = 'image' }) {
  const t = getToolTone(tone);
  const [liveBlogs, setLiveBlogs] = useState(null);

  useEffect(() => {
    fetchLiveBlogPosts().then((rows) => { if (rows) setLiveBlogs(rows); });
  }, []);

  const blogs = liveBlogs
    ? mergeBySlug(BLOG_POSTS, liveBlogs, 'slug')
        .map(normalizeBlogPost)
        .sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO))
        .slice(0, 3)
    : relatedBlogs;

  return (
    <div className="mt-6 space-y-6">
      {/* Ad banner — live, admin-controlled slot */}
      <AdBanner placement="tool-result-banner" />

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Related Tools</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {relatedTools.map((rt) => {
              const rtTone = getToolTone(rt.tone || tone);
              return (
                <Link
                  key={rt.slug}
                  to={`/tools/${rt.slug}`}
                  className={`group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-sm ${rtTone.ring}`}
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${rtTone.iconBg}`}>
                    <rt.Icon className={`h-4.5 w-4.5 ${rtTone.iconText}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-neutral-900">{rt.name}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Blogs */}
      {blogs.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-lg ${t.headerBg}`}>
              <Newspaper className={`h-5 w-5 ${t.headerText}`} />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Related Blogs</h2>
          </div>
          <ul className="space-y-4">
            {blogs.map((b) => (
              <li key={b.slug}>
                <Link to={`/blog/${b.slug}`} className="group flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`badge ${blogCategoryClass(b.category)}`}>{b.category}</span>
                    <div className="mt-1 truncate text-sm font-semibold text-neutral-900 group-hover:text-violet-600">
                      {b.title}
                    </div>
                    <div className="text-xs text-neutral-500">{b.readTime} min read</div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 group-hover:text-violet-500" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-lg ${t.headerBg}`}>
              <HelpCircle className={`h-5 w-5 ${t.headerText}`} />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Frequently asked questions</h2>
          </div>
          <FAQAccordion items={faqs} />
        </div>
      )}
    </div>
  );
}