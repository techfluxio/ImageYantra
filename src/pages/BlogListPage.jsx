import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Search, ChevronDown, Clock } from 'lucide-react';
import { BLOG_POSTS } from '../data/index.js';
import PageShell from '../components/layout/PageShell.jsx';
import { useLiveBlogPosts } from '../hooks/useLiveBlog.js';

const CATEGORY_STYLE = {
  Image: { grad: 'from-violet-200 to-fuchsia-200', badge: 'bg-violet-100 text-violet-700', glyph: '🖼️' },
  PDF:   { grad: 'from-sky-200 to-blue-200',        badge: 'bg-sky-100 text-sky-700',       glyph: '📄' },
  Exam:  { grad: 'from-rose-200 to-orange-200',     badge: 'bg-rose-100 text-rose-700',     glyph: '🎓' },
};

const CATEGORIES = ['All Categories', 'Image', 'PDF', 'Exam'];
const SORTS = ['Latest', 'Oldest', 'Quick reads'];

export default function BlogListPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Latest');

  const liveBlogPosts = useLiveBlogPosts(BLOG_POSTS);

  const posts = useMemo(() => {
    // Live (Supabase) posts use `date`/`read_time`; static posts use
    // `dateISO`/`readTime` — normalize so sorting/display works for both.
    let list = liveBlogPosts
      .filter((p) => p.published !== false)
      .map((p) => ({
        ...p,
        dateISO: p.dateISO || p.date,
        readTime: p.readTime ?? p.read_time ?? 4,
      }))
      .filter((p) => {
        const matchesQuery = !query || p.title.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'All Categories' || p.category === category;
        return matchesQuery && matchesCategory;
      });
    if (sort === 'Latest') list = [...list].sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
    if (sort === 'Oldest') list = [...list].sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
    if (sort === 'Quick reads') list = [...list].sort((a, b) => a.readTime - b.readTime);
    return list;
  }, [liveBlogPosts, query, category, sort]);

  return (
    <>
      <Head>
        <title>Blog — ImageYantra</title>
        <meta name="description" content="Tips, guides, and insights to help you work smarter with images, PDFs, and documents." />
      </Head>

      <PageShell>
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
          <Link to="/" className="hover:text-violet-600">Home</Link>
          <span>›</span>
          <span className="text-neutral-700">Blog</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
          ImageYantra <span className="text-violet-600">Blog</span>
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Tips, guides, and insights to help you work smarter with images, PDFs, and documents.
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs..."
              className="w-full border-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pl-4 pr-9 text-sm text-neutral-700 outline-none focus:border-violet-300"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pl-4 pr-9 text-sm text-neutral-700 outline-none focus:border-violet-300"
            >
              {SORTS.map((s) => <option key={s} value={s}>Sort by: {s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="mt-16 text-center text-neutral-500">No posts match your search.</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {posts.map((post) => {
              const style = CATEGORY_STYLE[post.category] || CATEGORY_STYLE.Image;
              return (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={`grid h-36 place-items-center bg-gradient-to-br ${style.grad} text-5xl`}>
                    {style.glyph}
                  </div>
                  <div className="p-5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.badge}`}>
                      {post.category} Tools
                    </span>
                    <h3 className="mt-3 text-base font-bold leading-snug text-neutral-900 group-hover:text-violet-700">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-500">
                        {post.author.charAt(0)}
                      </div>
                      <span className="font-medium text-neutral-700">{post.author}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span className="ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime} min read
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
}