import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Search, ArrowRight, FileOutput } from 'lucide-react';
import PageShell from '../layout/PageShell.jsx';
import { getTone } from '../../utils/tone.js';

/**
 * Shared shell for category listing pages (Image Tools, PDF Tools,
 * ID Photo Sizes, Social Tools, Other Tools).
 *
 * Same layout/behaviour as ExamToolsPage — breadcrumb, title, search bar,
 * a single row of category pills — but WITHOUT the authority-tag row,
 * since authorities only apply to Exam Tools.
 *
 * Props:
 *  - accentWord: the colored word in the H1 (e.g. "Tools")
 *  - leadWord: the plain word before it (e.g. "Image")
 *  - description: subtitle text
 *  - searchPlaceholder
 *  - crumbLabel: breadcrumb trail label (e.g. "Image Tools")
 *  - categories: [{ id, name }] — pass [{ id: 'all', name: 'All Tools' }] only to hide filter pills entirely
 *  - tools: [{ slug, name, desc, icon, category }]
 *  - icons: map of icon key -> lucide component
 *  - color: category tone key ('purple'|'red'|'green'|'blue'|'yellow'|'black') — drives
 *    the accent word, active filter pill, and tool icon tile colors so they match
 *    the category everywhere else it appears (home page, Most Used, etc).
 *  - basePath: route prefix each tool card links to, default '/tools'
 */
export default function CategoryToolsPage({
  accentWord,
  leadWord,
  description,
  searchPlaceholder,
  crumbLabel,
  categories = [],
  tools,
  icons = {},
  color = 'purple',
  basePath = '/tools',
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const tone = getTone(color);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const matchesQuery = !query || t.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [tools, activeCategory, query]);

  return (
    <>
      <Head>
        <title>{leadWord} {accentWord} — ImageYantra</title>
        <meta name="description" content={description} />
      </Head>

      <PageShell>
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
          <Link to="/" className="hover:text-violet-600">Home</Link>
          <span>›</span>
          <span className="text-neutral-700">{crumbLabel}</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
          {leadWord} <span className={tone.accent}>{accentWord}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-600">{description}</p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:outline-none"
          />
        </div>

        {categories.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === c.id
                    ? `${tone.pill} text-white`
                    : `border border-neutral-200 bg-white text-neutral-700 ${tone.ring}`
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-neutral-500">No tools match those filters.</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((tool) => {
              const Icon = icons[tool.icon] || FileOutput;
              return (
                <Link
                  key={tool.slug}
                  to={`${basePath}/${tool.slug}`}
                  className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
                >
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone.iconWrap}`}>
                    <Icon className={`h-5 w-5 ${tone.iconColor}`} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-neutral-900">{tool.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-neutral-500">{tool.desc}</p>
                  <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${tone.accent} group-hover:gap-1.5`}>
                    Use Tool <ArrowRight className="h-3.5 w-3.5 transition-all" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
}
