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
import { renderPdfThumbnails, removePdfPages, extractPdfPages } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'arrange-pdf',  name: 'Arrange PDF',  Icon: iconForSlug('arrange-pdf', PDF_TOOLS) },
  { slug: 'split-pdf',    name: 'Split PDF',    Icon: iconForSlug('split-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf', name: 'Compress PDF', Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
];

/** mode: 'remove' (delete tapped pages) | 'extract' (keep only tapped pages) */
export function makePageSelectPdfPage({ mode }) {
  const isRemove = mode === 'remove';
  const label = isRemove ? 'Remove Pages' : 'Extract Pages';
  const faqs = [
    { q: 'Does this change the quality of the remaining pages?', a: 'No — pages you keep are copied exactly as-is, with no rasterizing or recompression, unless the original file is unusually large, in which case one automatic high-quality pass keeps the output compact.' },
    { q: 'How do I pick pages?', a: `Tap any page thumbnail to ${isRemove ? 'mark it for removal' : 'select it for extraction'}. Tap again to undo.` },
    { q: 'Is my PDF uploaded to a server?', a: 'No. Everything happens in your browser — your file never leaves your device.' },
  ];

  return function PageSelectPdfPage() {
    return (
      <>
        <Head>
          <title>{label} — ImageYantra</title>
          <meta name="description" content={isRemove ? 'Delete specific pages from a PDF document.' : 'Pull specific pages out of a PDF into a new file.'} />
        </Head>
        <PageShell>
          <ToolShell
            title={isRemove ? 'Remove' : 'Extract'}
            titleAccent="PAGES"
            description={isRemove ? 'Tap the pages you want to delete, then download the result.' : 'Tap the pages you want to keep, then download them as a new PDF.'}
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
                <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={faqs} tone="pdf" />
              </>
            )}
          >
            {(files, api) => <PageSelectWorking file={files[0]} api={api} mode={mode} />}
          </ToolShell>
        </PageShell>
      </>
    );
  };
}

function PageSelectWorking({ file, api, mode }) {
  const isRemove = mode === 'remove';
  const label = isRemove ? 'Remove Pages' : 'Extract Pages';
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
    renderPdfThumbnails(file)
      .then(({ count, thumbs: t }) => {
        if (cancelled) return;
        setThumbs(t);
        setOrder(Array.from({ length: count }, (_, i) => i));
      })
      .catch((e) => { if (!cancelled) { reportToolError('extract-pages', e); setError(e.message || 'Could not read this PDF.'); } })
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
    let result;
    if (isRemove) {
      result = await removePdfPages(file, selected);
    } else {
      const keepOrdered = order.filter((i) => selected.has(i));
      result = await extractPdfPages(file, keepOrdered);
    }
    setBusy(false);
    api.goToResult({
      ...result,
      originalSize,
      filename: file.name.replace(/\.pdf$/i, '') + (isRemove ? '-edited.pdf' : '-extracted.pdf'),
      note: result.rasterized ? 'Automatically optimized to fit the size target.' : undefined,
    });
  }

  const count = order.length;
  const targetCount = isRemove ? count - selected.size : selected.size;
  const canRun = isRemove ? selected.size > 0 && selected.size < count : selected.size > 0;

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
            <Loader2 className="h-4 w-4 animate-spin" /> Rendering pages…
          </div>
        )}
        {error && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
        {!loading && !error && (
          <PdfPageGrid
            thumbs={thumbs}
            order={order}
            selected={selected}
            onToggle={toggle}
            selectHint={isRemove ? 'Remove' : 'Keep'}
          />
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold text-neutral-900">{label}</div>
          <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            {count > 0 ? (
              <>
                {selected.size} of {count} pages selected
                {count > 0 && <> — result will have <strong>{Math.max(targetCount, 0)}</strong> page{targetCount === 1 ? '' : 's'}.</>}
              </>
            ) : 'Waiting for pages to render…'}
          </div>
          <button
            type="button"
            onClick={handleRun}
            disabled={busy || !canRun}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Processing…' : <>{isRemove ? 'Remove Selected' : 'Extract Selected'} <ArrowRight className="h-4 w-4" /></>}
          </button>
          {isRemove && selected.size === count && count > 0 && (
            <p className="mt-2 text-center text-xs text-rose-500">Can't remove every page.</p>
          )}
        </div>
      </div>
    </div>
  );
}
