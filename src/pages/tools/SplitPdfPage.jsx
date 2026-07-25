import { useEffect, useState } from 'react';
import { reportToolError } from '../../utils/errorReporting.js';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import { renderPdfThumbnails, splitPdf } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'merge-pdf',     name: 'Merge PDF',     Icon: iconForSlug('merge-pdf', PDF_TOOLS) },
  { slug: 'arrange-pdf',   name: 'Arrange PDF',   Icon: iconForSlug('arrange-pdf', PDF_TOOLS) },
  { slug: 'remove-pages',  name: 'Remove Pages',  Icon: iconForSlug('remove-pages', PDF_TOOLS) },
];

const FAQS = [
  { q: 'How does splitting work?', a: 'Choose how many pages should go in each output file — the PDF is cut into consecutive chunks of that size and packaged as a zip.' },
  { q: 'Does splitting lose any quality?', a: 'No — every page is copied exactly as-is into its new file.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Splitting happens entirely in your browser.' },
];

export default function SplitPdfPage() {
  return (
    <>
      <Head>
        <title>Split PDF — ImageYantra</title>
        <meta name="description" content="Split a large PDF into multiple separate files." />
      </Head>
      <PageShell>
        <ToolShell
          title="Split"
          titleAccent="PDF"
          description="Break a large PDF into smaller files of equal length."
          accept="application/pdf"
          multiple={false}
          maxFiles={1}
          fileNoun="PDF"
          renderResult={(result, api) => (
            <>
              <PdfResult
                blob={result.blob}
                filename={result.filename}
                note={`${result.parts} PDF${result.parts === 1 ? '' : 's'} packaged into this zip.`}
                onReset={api.reset}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <SplitWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function SplitWorking({ file, api }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [perFile, setPerFile] = useState(1);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    renderPdfThumbnails(file, { maxWidth: 40 })
      .then(({ count }) => { if (!cancelled) { setPageCount(count); setPerFile(Math.max(1, Math.ceil(count / 2))); } })
      .catch((e) => { if (!cancelled) { reportToolError('split-pdf', e); setError(e.message || 'Could not read this PDF.'); } })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [file]);

  const numParts = pageCount ? Math.ceil(pageCount / perFile) : 0;

  async function handleSplit() {
    setBusy(true);
    const result = await splitPdf(file, perFile, (pct, msg) => setProgress({ pct, msg }));
    setBusy(false);
    api.goToResult({ ...result, filename: file.name.replace(/\.pdf$/i, '') + '-split.zip' });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="min-w-0 truncate text-sm font-semibold text-neutral-900">{file?.name}</div>
          <button
            type="button"
            onClick={api.removeAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading PDF…
          </div>
        )}
        {error && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
        {!loading && !error && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-50 py-14 text-center">
            <div className="text-3xl font-extrabold text-neutral-900">{pageCount}</div>
            <div className="text-sm text-neutral-500">total pages</div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold text-neutral-900">Split Settings</div>
          <label className="block text-xs font-medium text-neutral-600">Pages per file</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, pageCount)}
            value={perFile}
            onChange={(e) => setPerFile(Math.max(1, Math.min(pageCount || 1, Number(e.target.value) || 1)))}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
          <div className="mt-3 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Will produce <strong>{numParts}</strong> file{numParts === 1 ? '' : 's'} of up to {perFile} page{perFile === 1 ? '' : 's'} each, zipped together.
          </div>
          <button
            type="button"
            onClick={handleSplit}
            disabled={busy || loading || !pageCount}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Splitting…') : <>Split PDF <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
