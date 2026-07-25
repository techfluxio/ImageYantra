import { useEffect, useState } from 'react';
import { reportToolError } from '../../utils/errorReporting.js';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Trash2, Loader2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import { renderPdfThumbnails, pdfToJpgs } from '../../utils/pdfProcessing.js';
import { downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'jpg-to-pdf',    name: 'JPG to PDF',    Icon: iconForSlug('jpg-to-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf',  name: 'Compress PDF',  Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
  { slug: 'split-pdf',     name: 'Split PDF',     Icon: iconForSlug('split-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'Does every page become a separate JPG?', a: 'Yes — each page of the PDF is rendered as its own full-resolution JPG image that you can download individually or all at once.' },
  { q: 'What resolution are the images?', a: 'Pages are rendered at roughly 192 DPI by default, which is sharp enough for screen viewing and most printing needs.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Conversion happens entirely in your browser using the PDF rendering engine — your file never leaves your device.' },
];

export default function PdfToJpgPage() {
  return (
    <>
      <Head>
        <title>PDF to JPG — ImageYantra</title>
        <meta name="description" content="Convert each page of a PDF into a JPG image." />
      </Head>
      <PageShell>
        <ToolShell
          title="PDF to"
          titleAccent="JPG"
          description="Turn every page of a PDF into a downloadable JPG image."
          accept="application/pdf"
          multiple={false}
          maxFiles={1}
          fileNoun="PDF"
          renderResult={(results, api) => (
            <>
              <ToolResult
                items={results}
                onReset={api.reset}
                onDownloadAll={() => results.forEach((r) => downloadDataURL(r.downloadUrl, r.name))}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <PdfToJpgWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function PdfToJpgWorking({ file, api }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbs, setThumbs] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState('standard'); // 'standard' | 'high'
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    renderPdfThumbnails(file, { maxWidth: 220 })
      .then(({ count, thumbs: t }) => { if (!cancelled) { setPageCount(count); setThumbs(t); } })
      .catch((e) => { if (!cancelled) { reportToolError('pdf-to-jpg', e); setError(e.message || 'Could not read this PDF.'); } })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [file]);

  async function handleConvert() {
    setBusy(true);
    setProgress({ pct: 0, msg: 'Starting…' });
    const scale = quality === 'high' ? 3 : 2;
    try {
      const { pages } = await pdfToJpgs(file, { scale, quality: 0.92 }, (pct, msg) => setProgress({ pct, msg }));
      const base = file.name.replace(/\.pdf$/i, '');
      const items = pages.map((p, i) => ({
        name: `${base}-page-${i + 1}.jpg`,
        thumb: p.dataUrl,
        originalSize: file.size,
        newSize: p.size,
        downloadUrl: p.dataUrl,
        dims: `${p.width} × ${p.height} px`,
      }));
      setBusy(false);
      api.goToResult(items);
    } catch (e) {
      reportToolError('pdf-to-jpg', e);
      setBusy(false);
      setError(e.message || 'Could not convert this PDF.');
    }
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
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {thumbs.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <img src={src} alt={`Page ${i + 1}`} className="w-full bg-neutral-50 object-contain" />
                <div className="px-2 py-1 text-center text-[11px] text-neutral-500">Page {i + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold text-neutral-900">PDF to JPG Settings</div>

          <label className="text-xs font-medium text-neutral-600">Image quality</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'high', label: 'High' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setQuality(opt.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  quality === opt.id
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            {loading
              ? 'Reading pages…'
              : `Will convert all ${pageCount} page${pageCount === 1 ? '' : 's'} into separate JPG images.`}
          </div>

          <button
            type="button"
            onClick={handleConvert}
            disabled={busy || loading || !pageCount}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Converting…') : <>Convert to JPG <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
