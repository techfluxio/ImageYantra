import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import {
  Search, Image as ImageIcon, FileText, GraduationCap, Users, MessageCircle, Plus,
  ArrowRight, HelpCircle, Newspaper, Calendar, X,
} from 'lucide-react';

import { CATEGORIES, POPULAR_TOOLS, BLOG_POSTS, FAQS, ID_PHOTO_SIZES } from '../data/index.js';
import { IMAGE_TOOLS } from '../data/imageTools.js';
import { PDF_TOOLS } from '../data/pdfTools.js';
import { EXAM_TOOLS } from '../data/examTools.js';
import { SOCIAL_TOOLS } from '../data/socialTools.js';
import { OTHER_TOOLS } from '../data/otherTools.js';
import { FAQAccordion } from '../components/ui/index.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import { blogCategoryClass } from '../utils/helpers.js';
import { toolIcon } from '../utils/toolIcons.js';
import { fetchLiveBlogPosts, fetchLiveTools, mergeBySlug, normalizeBlogPost } from '../utils/publicApi.js';



/* ── Category → Tailwind tone map (keyed off data/index.js CATEGORIES[].color) ── */
const CATEGORY_ICONS = {
  'image-tools': ImageIcon, 'pdf-tools': FileText, 'exam-tools': GraduationCap,
  'id-photo-sizes': Users, 'social-tools': MessageCircle, 'other-tools': Plus,
};
const TONE = {
  purple: { iconWrap: 'bg-violet-100', iconColor: 'text-violet-600', tint: 'bg-violet-50/70', border: 'border-violet-100', link: 'text-violet-600 hover:text-violet-700', toolAccent: 'bg-violet-100 text-violet-600' },
  red:    { iconWrap: 'bg-red-100',    iconColor: 'text-red-500',    tint: 'bg-red-50/70',    border: 'border-red-100',    link: 'text-red-500 hover:text-red-600',       toolAccent: 'bg-red-100 text-red-500' },
  green:  { iconWrap: 'bg-emerald-100',iconColor: 'text-emerald-600',tint: 'bg-emerald-50/70',border: 'border-emerald-100',link: 'text-emerald-600 hover:text-emerald-700',toolAccent: 'bg-emerald-100 text-emerald-600' },
  blue:   { iconWrap: 'bg-blue-100',   iconColor: 'text-blue-500',   tint: 'bg-blue-50/70',   border: 'border-blue-100',   link: 'text-blue-500 hover:text-blue-600',     toolAccent: 'bg-blue-100 text-blue-500' },
  yellow: { iconWrap: 'bg-amber-100',  iconColor: 'text-amber-500',  tint: 'bg-amber-50/70',  border: 'border-amber-100',  link: 'text-amber-500 hover:text-amber-600',   toolAccent: 'bg-amber-100 text-amber-600' },
  black:  { iconWrap: 'bg-neutral-900',iconColor: 'text-white',      tint: 'bg-neutral-50',   border: 'border-neutral-200',link: 'text-neutral-800 hover:text-neutral-900',toolAccent: 'bg-neutral-200 text-neutral-800' },
};

const MOST_USED_TONE_BY_COLOR = {
  purple: { wrap: 'bg-violet-50',  color: 'text-violet-600' },
  red:    { wrap: 'bg-red-50',     color: 'text-red-500' },
  green:  { wrap: 'bg-emerald-50', color: 'text-emerald-600' },
  blue:   { wrap: 'bg-sky-50',     color: 'text-sky-600' },
  yellow: { wrap: 'bg-amber-50',   color: 'text-amber-600' },
  black:  { wrap: 'bg-neutral-100',color: 'text-neutral-800' },
};

/* ── Popular search shortcuts shown under the search bar ─── */
const POPULAR_SEARCHES = [
  { label: 'Compress PDF',   slug: 'compress-pdf' },
  { label: 'Compress Image', slug: 'compress-image' },
  { label: 'Passport Photo', slug: 'passport-photo' },
  { label: 'PAN Card Photo', slug: 'pan-card-photo' },
  { label: 'SSC Photo',      slug: 'ssc-photo' },
  { label: 'JEE Photo',      slug: 'jee-photo' },
  { label: 'Merge PDF',      slug: 'merge-pdf' },
  { label: 'Background Remove', slug: 'background-remove' },
  { label: 'Resize Image',   slug: 'resize-image' },
  { label: 'NEET Photo',     slug: 'neet-photo' },
];

/* ── Small building blocks ────────────────────────────── */
function ToolCard({ title, sub, accent, onClick, Icon }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full"
    >
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-neutral-900">{title}</div>
        <div className="truncate text-[11px] text-neutral-500">{sub}</div>
      </div>
    </button>
  );
}

function CategorySection({ title, categoryId, tools, viewAllPath }) {
  const navigate = useNavigate();
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const tone = TONE[cat?.color || 'purple'];
  const Icon = CATEGORY_ICONS[categoryId] || ImageIcon;
  return (
    <section className={`rounded-2xl ${tone.tint} ${tone.border} border p-5 md:p-6 mb-6`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone.iconWrap}`}>
            <Icon className={`h-5 w-5 ${tone.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        </div>
        <a onClick={() => navigate(viewAllPath)} className={`inline-flex items-center gap-1 text-sm font-medium cursor-pointer ${tone.link}`}>
          View all <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tools.map((t) => (
          <ToolCard
            key={t.slug}
            title={t.name}
            sub={t.desc ? t.desc.split('.')[0] : (t.dims || t.authority || '')}
            accent={tone.toolAccent}
            Icon={toolIcon(t.icon)}
            onClick={() => navigate(t._path || `/tools/${t.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef(null);

  const allSearchable = useMemo(() => ([
    ...IMAGE_TOOLS.map((t) => ({ ...t, _path: `/tools/${t.slug}`, _cat: 'Image Tools' })),
    ...PDF_TOOLS.map((t) => ({ ...t, _path: `/tools/${t.slug}`, _cat: 'PDF Tools' })),
    ...ID_PHOTO_SIZES.map((t) => ({ ...t, _path: `/tools/${t.slug}`, _cat: 'ID Photo Sizes' })),
    ...SOCIAL_TOOLS.map((t) => ({ ...t, _path: `/tools/${t.slug}`, _cat: 'Social Tools' })),
    ...OTHER_TOOLS.map((t) => ({ ...t, _path: `/tools/${t.slug}`, _cat: 'Other Tools' })),
    ...EXAM_TOOLS.map((t) => ({ ...t, _path: `/tools/${t.slug}`, _cat: 'Exam Tools' })),
  ]), []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const words = q.split(/\s+/).filter(Boolean);
    return allSearchable
      .filter((t) => {
        const hay = `${t.name} ${t.desc || ''}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 8);
  }, [query, allSearchable]);

  const showPanel = focused && query.trim().length > 0;

  function goTo(path) {
    setQuery('');
    setFocused(false);
    navigate(path);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && matches.length > 0) {
      goTo(matches[0]._path);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  }

  return (
    <div className="mt-6 max-w-3xl">
      <div className="relative">
        <div className={`flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 ring-1 transition ${focused ? 'ring-violet-400' : 'ring-violet-100'}`}>
          <Search className="h-5 w-5 shrink-0 text-violet-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { blurTimer.current = setTimeout(() => setFocused(false), 150); }}
            onKeyDown={handleKeyDown}
            placeholder="Search Tools - compress image, ssc photo, etc"
            aria-label="Search tools"
            autoComplete="off"
            className="w-full border-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-violet-100 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showPanel && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
            {matches.length > 0 ? (
              matches.map((t) => {
                const Icon = toolIcon(t.icon);
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onMouseDown={() => goTo(t._path)}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-violet-50"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-100">
                      <Icon className="h-4.5 w-4.5 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-neutral-900">{t.name}</div>
                      <div className="truncate text-xs text-neutral-500">{t._cat}</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-sm text-neutral-500">No tools found for "{query}"</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500">Popular:</span>
        {POPULAR_SEARCHES.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => navigate(`/tools/${p.slug}`)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 hover:border-violet-300 hover:text-violet-600"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const examItems = EXAM_TOOLS.slice(0, 16).map((t) => ({ ...t, _path: `/tools/${t.slug}` }));

  const [liveBlogs, setLiveBlogs] = useState(null);
  const [liveTools, setLiveTools] = useState(null);
  useEffect(() => {
    fetchLiveBlogPosts().then((rows) => { if (rows) setLiveBlogs(rows); });
    fetchLiveTools().then((rows) => { if (rows) setLiveTools(rows); });
  }, []);

  /** Merges a category's bundled static tools with any admin-added tools
   *  for that same category (matched by category_slug), so a newly
   *  created tool shows up on the homepage immediately instead of only
   *  after the next full rebuild. */
  function withLiveTools(staticList, categorySlug) {
    if (!liveTools) return staticList;
    const forCategory = liveTools.filter((t) => t.category_slug === categorySlug);
    return mergeBySlug(staticList, forCategory, 'slug');
  }
  const recentBlogs = useMemo(() => {
    const posts = liveBlogs !== null ? liveBlogs.map(normalizeBlogPost) : BLOG_POSTS;
    return [...posts].sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO)).slice(0, 8);
  }, [liveBlogs]);

  return (
    <>
      <Head>
        <title>ImageYantra — Free Online Image &amp; PDF Tools</title>
        <meta
          name="description"
          content="Free browser-based tools to compress, resize, crop and convert images, merge and compress PDFs, and prepare exam documents to official specs. No signup. No upload."
        />
        <link rel="canonical" href="https://imageyantra.in/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'ImageYantra',
          url: 'https://imageyantra.in',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://imageyantra.in/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        })}</script>
      </Head>

      <PageShell>
        {/* Hero */}
        <section className="mb-8">
          <h1 className="max-w-4xl text-2xl font-semibold leading-snug tracking-tight text-neutral-900 md:text-4xl">
            Compress, resize, convert, and optimize images, PDFs, and exam
            documents—instantly in your{' '}
            <span className="text-violet-600">BROWSER.</span>
          </h1>

          <SearchBar />
        </section>

            {/* Choose Category */}
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Choose Category</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORIES.map((cat) => {
                  const tone = TONE[cat.color] || TONE.purple;
                  const Icon = CATEGORY_ICONS[cat.id] || ImageIcon;
                  return (
                    <a
                      key={cat.id}
                      onClick={() => navigate(cat.path)}
                      className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone.iconWrap}`}>
                          <Icon className={`h-5 w-5 ${tone.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">{cat.name}</div>
                          <div className="text-xs text-neutral-500">{cat.count}+ tools</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>
            </section>

            {/* Most Used */}
            <section className="mb-12">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Most Used</h2>
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
                {POPULAR_TOOLS.map((t) => {
                  const Icon = toolIcon(t.icon);
                  const cat = CATEGORIES.find((c) => c.id === t.category);
                  const tone = MOST_USED_TONE_BY_COLOR[cat?.color] || MOST_USED_TONE_BY_COLOR.purple;
                  return (
                    <a key={t.slug} onClick={() => navigate(`/tools/${t.slug}`)} className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className={`grid h-14 w-14 place-items-center rounded-full ${tone.wrap} ring-1 ring-black/5 group-hover:scale-105 transition-transform`}>
                        <Icon className={`h-6 w-6 ${tone.color}`} />
                      </div>
                      <div className="text-center text-xs font-medium text-neutral-700">{t.name}</div>
                    </a>
                  );
                })}
              </div>
            </section>

            {/* Category sections */}
            <div>
              <CategorySection title="Image Tools"    categoryId="image-tools" tools={withLiveTools(IMAGE_TOOLS, 'image-tools').slice(0, 18)} viewAllPath="/image-tools" />
              <CategorySection title="PDF Tools"       categoryId="pdf-tools"   tools={withLiveTools(PDF_TOOLS, 'pdf-tools').slice(0, 18)}   viewAllPath="/pdf-tools" />
              <CategorySection title="Exam Tools"      categoryId="exam-tools"  tools={withLiveTools(examItems, 'exam-tools')}                viewAllPath="/exam-tools" />
              <CategorySection title="ID Photo Sizes"  categoryId="id-photo-sizes"  tools={withLiveTools(ID_PHOTO_SIZES, 'id-photo-sizes')}       viewAllPath="/id-photo-sizes" />
              <CategorySection title="Social Tools"    categoryId="social-tools" tools={withLiveTools(SOCIAL_TOOLS, 'social-tools')}        viewAllPath="/social-tools" />
              <CategorySection title="Other Tools"     categoryId="other-tools" tools={withLiveTools(OTHER_TOOLS, 'other-tools')}          viewAllPath="/other-tools" />
            </div>

            {/* FAQ + Recent Blogs */}
            <section className="mt-4 grid gap-6 lg:grid-cols-5">
              {/* FAQ */}
              <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 lg:col-span-3">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-100">
                    <HelpCircle className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Frequently asked questions</h2>
                    <p className="text-xs text-neutral-500">Everything you need to know about ImageYantra.</p>
                  </div>
                </div>
                <div className="flex-1">
                  <FAQAccordion items={FAQS.slice(0, 8)} />
                </div>
              </div>

              {/* Recent Blogs */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100">
                      <Newspaper className="h-5 w-5 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900">Recent blogs</h2>
                  </div>
                  <a onClick={() => navigate('/blog')} className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 cursor-pointer">
                    All posts <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <ul className="space-y-4">
                  {recentBlogs.map((b) => (
                    <li key={b.slug}>
                      <a onClick={() => navigate(`/blog/${b.slug}`)} className="group block rounded-xl p-3 -mx-3 hover:bg-neutral-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${blogCategoryClass(b.category)} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>{b.category}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                            <Calendar className="h-3 w-3" /> {b.date}
                          </span>
                          <span className="text-[11px] text-neutral-400">· {b.readTime} min read</span>
                        </div>
                        <div className="mt-1.5 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-violet-600">
                          {b.title}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
      </PageShell>
    </>
  );
}