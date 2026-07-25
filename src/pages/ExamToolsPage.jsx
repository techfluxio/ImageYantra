import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import {
  Search, SquareUser, PenTool, FileText, Fingerprint, Maximize2,
  PenSquare, ScanLine, Ruler, HardDrive, Eye, FileOutput, ArrowRight, ChevronDown,
} from 'lucide-react';
import { EXAM_TOOLS, EXAM_AUTHORITIES } from '../data/examTools.js';
import PageShell from '../components/layout/PageShell.jsx';
import { getTone } from '../utils/tone.js';

const tone = getTone('green');

const ICONS = {
  photo: SquareUser,
  signature: PenTool,
  documents: FileText,
  thumb: Fingerprint,
  resizer: Maximize2,
  sigresizer: PenSquare,
  thumbresizer: ScanLine,
  dimensions: Ruler,
  filesize: HardDrive,
  preview: Eye,
};

/** How many authority pills show before the "More" toggle appears. */
const VISIBLE_AUTHORITY_COUNT = 6;

export default function ExamToolsPage() {
  const [activeAuthority, setActiveAuthority] = useState(null);
  const [showAllAuthorities, setShowAllAuthorities] = useState(false);
  const [query, setQuery] = useState('');

  const visibleAuthorities = showAllAuthorities
    ? EXAM_AUTHORITIES
    : EXAM_AUTHORITIES.slice(0, VISIBLE_AUTHORITY_COUNT);

  const tools = useMemo(() => {
    return EXAM_TOOLS.filter((t) => {
      const matchesAuthority = !activeAuthority || t.authorities.includes(activeAuthority);
      const matchesQuery = !query || t.name.toLowerCase().includes(query.toLowerCase());
      return matchesAuthority && matchesQuery;
    });
  }, [activeAuthority, query]);

  return (
    <>
      <Head>
        <title>Exam Tools — ImageYantra</title>
        <meta name="description" content="Free online tools to help students prepare, convert, and organize exam documents with ease." />
      </Head>

      <PageShell>
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
          <Link to="/" className="hover:text-violet-600">Home</Link>
          <span>›</span>
          <span className="text-neutral-700">Exam Tools</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
          Exam <span className="text-emerald-600">Tools</span>
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Free online tools to help students prepare, convert, and organize exam documents with ease.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exam tools..."
            className="w-full border-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:outline-none"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveAuthority(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !activeAuthority
                ? `${tone.pill} text-white`
                : `border border-neutral-200 bg-white text-neutral-700 ${tone.ring}`
            }`}
          >
            All
          </button>

          {visibleAuthorities.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setActiveAuthority(a === activeAuthority ? null : a)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeAuthority === a
                  ? `${tone.pill} text-white`
                  : `border border-neutral-200 bg-white text-neutral-700 ${tone.ring}`
              }`}
            >
              {a}
            </button>
          ))}

          {EXAM_AUTHORITIES.length > VISIBLE_AUTHORITY_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllAuthorities((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-500 transition hover:border-violet-300 hover:text-violet-700"
            >
              {showAllAuthorities ? 'Less' : 'More'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllAuthorities ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {tools.length === 0 ? (
          <div className="mt-16 text-center text-neutral-500">No tools match those filters.</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = ICONS[tool.icon] || FileOutput;
              return (
                <Link
                  key={tool.slug}
                  to={`/tools/${tool.slug}`}
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
