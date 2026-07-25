import { useState } from 'react';
import { ArrowRight, SlidersHorizontal, FileText, X } from 'lucide-react';
import { imagesToPdf, rasterCompressPdf, formatBytes } from '../../utils/pdfProcessing.js';

/**
 * Working interface for "Documents" Exam Tools entries (e.g. JEE Documents,
 * SSC Documents) — accepts scanned images or PDFs for category / PwD /
 * certificate uploads and compresses each into a PDF that fits the exam's
 * required byte-size band.
 */
export default function ExamDocumentWorking({ tool, spec, files, api }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const maxKB = spec.sizeRange ? Math.round(spec.sizeRange.maxBytes / 1024) : 300;
  const minKB = spec.sizeRange ? Math.round(spec.sizeRange.minBytes / 1024) : 0;

  async function handlePrepare() {
    setBusy(true);
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Preparing ${i + 1} of ${files.length}…`);
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      let blob;
      if (isPdf) {
        const out = await rasterCompressPdf(file, { minBytes: minKB * 1024, maxBytes: maxKB * 1024 }, () => {});
        blob = out.blob;
      } else {
        const asPdf = await imagesToPdf([file]);
        const wrapped = new File([asPdf.blob], file.name.replace(/\.\w+$/, '') + '.pdf', { type: 'application/pdf' });
        const out = await rasterCompressPdf(wrapped, { minBytes: minKB * 1024, maxBytes: maxKB * 1024 }, () => {});
        blob = out.blob;
      }
      results.push({
        name: file.name.replace(/\.\w+$/, '') + `-${tool.slug}.pdf`,
        blob,
        originalSize: file.size,
        newSize: blob.size,
      });
    }
    setBusy(false);
    api.goToResult(results);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 text-sm font-semibold text-neutral-900">
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f, i) => (
            <div key={i} className="relative flex items-center gap-2 rounded-xl border border-neutral-200 p-3">
              <FileText className="h-5 w-5 shrink-0 text-rose-400" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-neutral-900">{f.name}</div>
                <div className="text-[11px] text-neutral-500">{formatBytes(f.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => api.removeOne(i)}
                className="rounded-full p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={api.addMore} className="mt-4 text-xs font-semibold text-violet-600 hover:text-violet-700">
          + Add more files
        </button>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" /> {tool.name} Settings
          </div>

          {spec.examName && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
              Official {spec.examName} specification
            </div>
          )}

          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
              <dt className="text-neutral-500">Output format</dt>
              <dd className="font-semibold text-neutral-900">{spec.format || 'PDF'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
              <dt className="text-neutral-500">Target size</dt>
              <dd className="font-semibold text-neutral-900">{spec.sizeLabel || `up to ${maxKB} KB`}</dd>
            </div>
          </dl>

          {spec.note && (
            <div className="mt-3 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">{spec.note}</div>
          )}

          <button
            type="button"
            onClick={handlePrepare}
            disabled={busy || !files.length}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress || 'Compressing…') : <>Prepare Document{files.length > 1 ? 's' : ''} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
