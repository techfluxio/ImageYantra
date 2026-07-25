import { useEffect, useState } from 'react';
import { ArrowRight, Trash2, SlidersHorizontal } from 'lucide-react';
import { readFileAsDataURL, loadImage, examFitImage, formatBytes } from '../../utils/imageProcessing.js';

/**
 * Working interface for Social Tools entries (YouTube Thumbnail, Instagram
 * Post, LinkedIn Banner, etc). Every entry carries a fixed target pixel
 * size (`tool.dims`) that the platform expects — the image is cover-fit
 * cropped onto that exact box, with an optional max file-size cap.
 */
export default function SocialImageWorking({ tool, dims, file, api }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const [capSize, setCapSize] = useState(false);
  const [maxKB, setMaxKB] = useState(500);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(async (url) => {
      setDataUrl(url);
      const img = await loadImage(url);
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    });
  }, [file]);

  async function handlePrepare() {
    if (!dataUrl || !dims) return;
    setBusy(true);
    const fit = await examFitImage(dataUrl, {
      width: dims.w,
      height: dims.h,
      bgColor: '#ffffff',
      maxBytes: capSize ? Math.round((Number(maxKB) || 500) * 1024) : undefined,
    });
    setBusy(false);
    api.goToResult([{
      name: file.name.replace(/\.\w+$/, '') + `-${tool.slug}.jpg`,
      thumb: fit.dataUrl,
      originalSize: file.size,
      newSize: fit.size,
      downloadUrl: fit.dataUrl,
      dims: `${fit.width} × ${fit.height} px`,
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

          <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs">
            <span className="text-neutral-500">Target size</span>
            <span className="font-semibold text-neutral-900">{dims ? `${dims.w} × ${dims.h} px` : '—'}</span>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-600">
            <input type="checkbox" checked={capSize} onChange={(e) => setCapSize(e.target.checked)} className="rounded border-neutral-300" />
            Cap file size
          </label>
          {capSize && (
            <input
              type="number" min="10" value={maxKB}
              onChange={(e) => setMaxKB(e.target.value)}
              placeholder="Max KB"
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            />
          )}

          <div className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            The photo is cropped to fill the exact frame — center-weighted, so the middle of your image stays in the shot.
          </div>

          <button
            type="button"
            onClick={handlePrepare}
            disabled={busy || !dataUrl}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Processing…' : <>Resize {tool.name} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
