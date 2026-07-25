import { useEffect, useState } from 'react';
import { ArrowRight, Trash2, RefreshCw, Info } from 'lucide-react';
import { readFileAsDataURL, loadImage, dataURLSize, formatBytes, fileFormatLabel } from '../../utils/imageProcessing.js';

/**
 * Shared "single image in, single image out" working UI for the simple
 * format-conversion tools (JPG⇄PNG, WEBP⇄JPG, JPG⇄WEBP, HEIC→JPG…).
 * The actual pixel work is supplied by the `convert` callback so each
 * tool page can plug in its own encoder while sharing one consistent
 * preview + settings layout.
 */
export default function FormatConvertWorking({
  file,
  api,
  toolLabel,
  outExt,
  outputName,
  convert,               // async (dataUrl, quality, file) => outputDataUrl
  allowQuality = true,
  defaultQuality = 0.92,
  note,
  previewUrl,            // optional pre-decoded preview (used by HEIC decode flow)
  previewNote,           // shown instead of the image when no preview is possible
}) {
  const [dataUrl, setDataUrl] = useState(previewUrl || null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [quality, setQuality] = useState(defaultQuality);
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState('');

  useEffect(() => {
    if (previewUrl) { setDataUrl(previewUrl); return; }
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const url = await readFileAsDataURL(file);
        if (cancelled) return;
        const img = await loadImage(url);
        if (cancelled) return;
        setDataUrl(url);
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      } catch {
        // Source format isn't natively renderable by <img> (e.g. HEIC) —
        // conversion still works, we just can't show a live preview.
        setDataUrl(null);
      }
    })();
    return () => { cancelled = true; };
  }, [file, previewUrl]);

  useEffect(() => {
    if (!dataUrl || !previewUrl) return;
    loadImage(dataUrl).then((img) => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })).catch(() => {});
  }, [dataUrl, previewUrl]);

  async function handleConvert() {
    if (!file) return;
    setBusy(true);
    setBusyMsg('Converting…');
    try {
      const srcUrl = dataUrl || (await readFileAsDataURL(file));
      const outUrl = await convert(srcUrl, quality, file);
      api.goToResult([{
        name: outputName ? outputName(file.name) : file.name.replace(/\.\w+$/, '') + `.${outExt}`,
        thumb: outUrl,
        originalSize: file.size,
        newSize: dataURLSize(outUrl),
        downloadUrl: outUrl,
        dims: naturalSize.w ? `${naturalSize.w} × ${naturalSize.h} px` : undefined,
      }]);
    } finally {
      setBusy(false);
      setBusyMsg('');
    }
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
        <div className="mx-auto flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
          {dataUrl ? (
            <img src={dataUrl} alt="preview" className="max-h-[520px] w-auto max-w-full object-contain" />
          ) : (
            <div className="max-w-xs p-8 text-center text-sm text-neutral-400">
              {previewNote || "A live preview isn't available for this format in your browser — conversion will still work normally."}
            </div>
          )}
        </div>
        <div className="mt-3 text-center text-xs text-neutral-500">
          {naturalSize.w > 0 && <>{naturalSize.w} × {naturalSize.h} px · </>}
          {formatBytes(file?.size)} · {fileFormatLabel(file)}
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <RefreshCw className="h-4 w-4 text-violet-600" /> {toolLabel} Settings
          </div>

          {note && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{note}</span>
            </div>
          )}

          {allowQuality && (
            <>
              <label className="text-xs font-medium text-neutral-600">Output Quality</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="range"
                  min="0.4"
                  max="1"
                  step="0.01"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <span className="w-12 shrink-0 text-right text-xs font-semibold text-neutral-700">
                  {Math.round(quality * 100)}%
                </span>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleConvert}
            disabled={busy || !file}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (busyMsg || 'Converting…') : <>Convert to {outExt.toUpperCase()} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
