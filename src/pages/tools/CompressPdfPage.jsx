import { useState } from 'react';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Trash2, SlidersHorizontal } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import { rasterCompressPdf, formatBytes } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'merge-pdf',    name: 'Merge PDF',    Icon: iconForSlug('merge-pdf', PDF_TOOLS) },
  { slug: 'split-pdf',    name: 'Split PDF',    Icon: iconForSlug('split-pdf', PDF_TOOLS) },
  { slug: 'arrange-pdf',  name: 'Arrange PDF',  Icon: iconForSlug('arrange-pdf', PDF_TOOLS) },
];

const PRESETS = [
  { label: '2MB',   kb: 2048 },
  { label: '1MB',   kb: 1024 },
  { label: '500KB', kb: 500 },
  { label: '200KB', kb: 200 },
  { label: '100KB', kb: 100 },
];

/** Shared engine behind Compress PDF and the fixed under-X-KB tools. */
export function makeCompressPdfPage({ fixedKB, slug } = {}) {
  const label = fixedKB ? `${fixedKB}KB` : null;
  const faqs = fixedKB
    ? [
        { q: `Will my PDF definitely end up under ${label}?`, a: `Yes — the tool searches quality and, if needed, resolution until the file fits at or under ${label}.` },
        { q: 'Will this affect quality?', a: `Fitting a PDF under ${label} is aggressive, so pages are rendered as high-quality images — text will no longer be selectable, but stays crisp and readable.` },
        { q: 'Is my PDF uploaded to a server?', a: 'No. Compression happens entirely in your browser.' },
      ]
    : [
        { q: 'Will compressing reduce quality?', a: 'A little, depending on your target. The tool renders pages at the highest quality that still fits your target size.' },
        { q: 'Why does the file become non-selectable text?', a: 'To reliably hit small size targets, pages are converted to high-quality images. For light compression with fully preserved text, try a larger target size.' },
        { q: 'Is my PDF uploaded to a server?', a: 'No. Compression happens entirely in your browser.' },
      ];

  return function CompressPdfPageInner() {
    return (
      <>
        <Head>
          <title>{fixedKB ? `Compress PDF under ${label}` : 'Compress PDF'} — ImageYantra</title>
          <meta name="description" content={fixedKB ? `Compress a PDF file to under ${label}.` : 'Reduce PDF file size while keeping it readable.'} />
        </Head>
        <PageShell>
          <ToolShell
            title={fixedKB ? 'Compress PDF under' : 'Compress'}
            titleAccent={fixedKB ? label : 'PDF'}
            description={fixedKB ? `Automatically compress your PDF to fit under ${label}.` : 'Shrink your PDF to a target size while keeping it readable.'}
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
                  onReset={api.reset}
                />
                <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={faqs} tone="pdf" />
              </>
            )}
          >
            {(files, api) => <CompressWorking file={files[0]} api={api} fixedKB={fixedKB} label={label} slug={slug} />}
          </ToolShell>
        </PageShell>
      </>
    );
  };
}

export default makeCompressPdfPage();

function CompressWorking({ file, api, fixedKB, label }) {
  const [targetKB, setTargetKB] = useState(fixedKB || 500);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });

  async function handleCompress() {
    setBusy(true);
    const originalSize = file.size;
    const maxBytes = (fixedKB ? Math.round(fixedKB * 0.95) : targetKB) * 1024;
    const minBytes = Math.round(maxBytes * 0.7);
    const result = await rasterCompressPdf(file, { minBytes, maxBytes }, (pct, msg) => setProgress({ pct, msg }));
    setBusy(false);
    api.goToResult({
      ...result,
      originalSize,
      filename: file.name.replace(/\.pdf$/i, '') + (fixedKB ? `-under-${label}.pdf` : '-compressed.pdf'),
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
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-50 py-14 text-center">
          <div className="text-2xl font-extrabold text-neutral-900">{formatBytes(file?.size)}</div>
          <div className="text-sm text-neutral-500">current size</div>
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" /> {fixedKB ? 'Fixed Target' : 'Compression Target'}
          </div>

          {fixedKB ? (
            <div className="rounded-lg border-2 border-violet-500 bg-violet-50 p-4 text-center">
              <div className="text-2xl font-extrabold text-violet-700">{label}</div>
              <div className="mt-0.5 text-xs text-violet-600">fixed target size</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.kb}
                    type="button"
                    onClick={() => setTargetKB(p.kb)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      targetKB === p.kb ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-xs font-medium text-neutral-600">Or enter a custom size (KB)</label>
              <input
                type="number"
                min={20}
                value={targetKB}
                onChange={(e) => setTargetKB(Math.max(20, Number(e.target.value) || 20))}
                className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
            </>
          )}

          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
            Pages are rendered at the highest quality that still fits under <strong>{fixedKB ? label : `${targetKB}KB`}</strong>.
          </div>

          <button
            type="button"
            onClick={handleCompress}
            disabled={busy || !file}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Compressing…') : <>Compress {fixedKB ? `under ${label}` : ''} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
