import { useEffect, useState } from 'react';
import { ArrowRight, Trash2, SlidersHorizontal } from 'lucide-react';
import {
  readFileAsDataURL, loadImage, dataURLSize, downloadDataURL,
  examFitImage, examFitImageContain, formatBytes,
} from '../../utils/imageProcessing.js';

/**
 * Working interface for any single-image Exam Tools entry — photograph,
 * signature, or thumb-impression resizers. `spec` comes from
 * getExamToolSpec() and carries the target pixel box + byte-size band.
 *
 * Photos are cover-fit (cropped to fill the box, like a standard
 * passport-photo crop). Signatures/thumbs are contain-fit (never
 * cropped) onto a white background instead, so no ink is cut off.
 */
export default function ExamImageWorking({ tool, spec, file, api, allowCustomTarget = false }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const [width, setWidth] = useState(spec.dims?.w || '');
  const [height, setHeight] = useState(spec.dims?.h || '');
  const [targetKB, setTargetKB] = useState(spec.sizeRange ? Math.round(spec.sizeRange.maxBytes / 1024) : 100);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(async (url) => {
      setDataUrl(url);
      const img = await loadImage(url);
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    });
  }, [file]);

  async function handlePrepare() {
    if (!dataUrl) return;
    setBusy(true);
    const w = Number(width) || natural.w;
    const h = Number(height) || natural.h;
    const maxBytes = spec.sizeRange ? spec.sizeRange.maxBytes : Math.round((Number(targetKB) || 100) * 1024);
    const minBytes = spec.sizeRange ? spec.sizeRange.minBytes : 0;

    const fit = spec.kind === 'photo'
      ? await examFitImage(dataUrl, { width: w, height: h, bgColor: '#ffffff', maxBytes, minBytes })
      : await examFitImageContain(dataUrl, { width: w, height: h, bgColor: '#ffffff', maxBytes, minBytes });

    setBusy(false);
    const base = file.name.replace(/\.\w+$/, '');
    api.goToResult([{
      name: `${base}-${tool.slug}.jpg`,
      thumb: fit.dataUrl,
      originalSize: file.size,
      newSize: fit.size,
      downloadUrl: fit.dataUrl,
      dims: `${fit.width} × ${fit.height} px`,
      belowMin: fit.belowMin,
    }]);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-sm font-semibold text-neutral-900">{file?.name}</div>
          <button
            type="button"
            onClick={api.removeAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
        {dataUrl && (
          <div className="mx-auto flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
            <img src={dataUrl} alt="preview" className="max-h-[520px] w-auto max-w-full object-contain" />
          </div>
        )}
        {natural.w > 0 && (
          <div className="mt-3 text-center text-xs text-neutral-500">
            Original: {natural.w} × {natural.h} px · {formatBytes(file?.size)}
          </div>
        )}
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

          {allowCustomTarget ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">Width (px)</label>
                <input
                  type="number" min="1" value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600">Height (px)</label>
                <input
                  type="number" min="1" value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-neutral-600">Max size (KB)</label>
                <input
                  type="number" min="1" value={targetKB}
                  onChange={(e) => setTargetKB(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                />
              </div>
            </div>
          ) : (
            <dl className="space-y-2 text-xs">
              <SpecRow label="Dimensions" value={spec.dimsLabel ? `${spec.dimsLabel}${spec.dims ? ` (${spec.dims.w}×${spec.dims.h} px)` : ''}` : '—'} />
              <SpecRow label="File size" value={spec.sizeLabel || '—'} />
              <SpecRow label="Format" value={spec.format} />
              {spec.bg && <SpecRow label="Background" value={spec.bg} />}
            </dl>
          )}

          {spec.note && (
            <div className="mt-3 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">{spec.note}</div>
          )}

          <button
            type="button"
            onClick={handlePrepare}
            disabled={busy || !dataUrl}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Processing…' : <>Resize &amp; Fit <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
