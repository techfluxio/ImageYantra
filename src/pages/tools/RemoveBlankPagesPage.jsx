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
import PdfPageGrid from '../../components/tools/PdfPageGrid.jsx';
import { renderPdfThumbnails, detectBlankPages, removeBlankPagesFromPdf } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'remove-pages', name: 'Remove Pages', Icon: iconForSlug('remove-pages', PDF_TOOLS) },
  { slug: 'split-pdf',    name: 'Split PDF',     Icon: iconForSlug('split-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf', name: 'Compress PDF',  Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'How are blank pages detected?', a: 'Each page is rendered and checked for non-white content. Pages with virtually no visible content (faint scanner artifacts included) are flagged as blank automatically.' },
  { q: 'Can I review before removing?', a: 'Yes — flagged pages are pre-selected but you can tap any page to include or exclude it before running.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Detection and removal both happen entirely in your browser.' },
];

export default function RemoveBlankPagesPage() {
  return (
    <>
      <Head>
        <title>Remove Blank Pages — ImageYantra</title>
        <meta name="description" content="Automatically detect and remove blank pages from a PDF." />
      </Head>
      <PageShell>
        <ToolShell
          title="Remove Blank"
          titleAccent="PAGES"
          description="Blank pages are found automatically — review and remove them in one click."
          accept="application/pdf"
          multiple={false}
          maxFiles={1}
          fileNoun="PDF"
          renderResult={(result, api) => (
            <>
              <PdfResult
                blob={result.blob}
                filename={result.filename}
                originalSize={result.originalSize}
                note={result.note}
                onReset={api.reset}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <BlankWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function BlankWorking({ file, api }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbs, setThumbs] = useState([]);
  const [order, setOrder] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    detectBlankPages(file)
      .then(({ count, thumbs: t, blankIdx }) => {
        if (cancelled) return;
        setThumbs(t);
        setOrder(Array.from({ length: count }, (_, i) => i));
        setSelected(new Set(blankIdx));
      })
      .catch((e) => { if (!cancelled) { reportToolError('remove-blank-pages', e); setError(e.message || 'Could not read this PDF.'); } })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [file]);

  function toggle(idx) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  async function handleRun() {
    setBusy(true);
    const originalSize = file.size;
    const result = await removeBlankPagesFromPdf(file, selected);
    setBusy(false);
    api.goToResult({
      ...result,
      originalSize,
      filename: file.name.replace(/\.pdf$/i, '') + '-cleaned.pdf',
      note: result.rasterized ? 'Automatically optimized to fit the size target.' : undefined,
    });
  }

  const count = order.length;

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
            <Loader2 className="h-4 w-4 animate-spin" /> Scanning for blank pages…
          </div>
        )}
        {error && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
        {!loading && !error && (
          <PdfPageGrid thumbs={thumbs} order={order} selected={selected} onToggle={toggle} selectHint="Remove" />
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold text-neutral-900">Remove Blank Pages</div>
          <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            {loading ? 'Scanning pages…' : selected.size > 0
              ? `${selected.size} blank page${selected.size === 1 ? '' : 's'} found and pre-selected out of ${count}.`
              : `No blank pages detected out of ${count}. You can still tap any page to remove it manually.`}
          </div>
          <button
            type="button"
            onClick={handleRun}
            disabled={busy || loading || selected.size === 0 || selected.size === count}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Removing…' : <>Remove {selected.size || ''} Page{selected.size === 1 ? '' : 's'} <ArrowRight className="h-4 w-4" /></>}
          </button>
          {selected.size === count && count > 0 && (
            <p className="mt-2 text-center text-xs text-rose-500">Can't remove every page. Deselect at least one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
