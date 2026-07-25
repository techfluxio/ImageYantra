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
import { renderPdfThumbnails, reorderPdf } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'remove-pages',  name: 'Remove Pages',  Icon: iconForSlug('remove-pages', PDF_TOOLS) },
  { slug: 'split-pdf',     name: 'Split PDF',     Icon: iconForSlug('split-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf',  name: 'Compress PDF',  Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'Does reordering pages lose any quality?', a: 'No — pages are copied exactly as-is, no rasterizing or recompression, unless the file is unusually large, in which case one automatic high-quality pass keeps the output compact.' },
  { q: 'How do I reorder pages?', a: 'Drag any page thumbnail and drop it where you want it. The page number badge updates live.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Everything happens in your browser — your file never leaves your device.' },
];

export default function ArrangePdfPage() {
  return (
    <>
      <Head>
        <title>Arrange PDF — ImageYantra</title>
        <meta name="description" content="Drag and drop to reorder pages in any PDF document." />
      </Head>
      <PageShell>
        <ToolShell
          title="Arrange"
          titleAccent="PDF"
          description="Drag pages into the order you want, then download."
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
          {(files, api) => <ArrangeWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function ArrangeWorking({ file, api }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbs, setThumbs] = useState([]);
  const [order, setOrder] = useState([]);
  const [original, setOriginal] = useState([]);
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
        const initial = Array.from({ length: count }, (_, i) => i);
        setOrder(initial);
        setOriginal(initial);
      })
      .catch((e) => { if (!cancelled) { reportToolError('arrange-pdf', e); setError(e.message || 'Could not read this PDF.'); } })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [file]);

  const changed = JSON.stringify(order) !== JSON.stringify(original);

  async function handleSave() {
    setBusy(true);
    const originalSize = file.size;
    const result = await reorderPdf(file, order);
    setBusy(false);
    api.goToResult({
      ...result,
      originalSize,
      filename: file.name.replace(/\.pdf$/i, '') + '-arranged.pdf',
      note: result.rasterized ? 'Automatically optimized to fit the size target.' : undefined,
    });
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
            <Loader2 className="h-4 w-4 animate-spin" /> Rendering pages…
          </div>
        )}
        {error && <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
        {!loading && !error && <PdfPageGrid thumbs={thumbs} order={order} onReorder={setOrder} />}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold text-neutral-900">Arrange PDF</div>
          <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Drag any page and drop it into a new position. Numbers update live so you always see the final order.
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || loading || !changed}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Saving…' : <>Save New Order <ArrowRight className="h-4 w-4" /></>}
          </button>
          {!changed && !loading && <p className="mt-2 text-center text-xs text-neutral-400">Reorder at least one page to enable saving.</p>}
        </div>
      </div>
    </div>
  );
}
