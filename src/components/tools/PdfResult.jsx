import { useEffect, useState } from 'react';
import { CheckCircle2, Download, RotateCcw, Users2, FileText, FileArchive } from 'lucide-react';
import { formatBytes, saveBlob, renderPdfBlobThumbnail } from '../../utils/pdfProcessing.js';

/**
 * @param {Blob} blob
 * @param {string} filename
 * @param {number} [originalSize]
 * @param {string} [note]  extra context line, e.g. "3 pages removed" or "rasterized to hit target size"
 */
export default function PdfResult({ blob, filename, originalSize, note, onReset }) {
  const finalSize = blob?.size || 0;
  const savedPct = originalSize ? Math.round((1 - finalSize / originalSize) * 100) : null;
  const isZip = /\.zip$/i.test(filename || '') || blob?.type === 'application/zip';

  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setThumb(null);
    if (blob && !isZip) {
      renderPdfBlobThumbnail(blob, { maxWidth: 200 }).then((url) => {
        if (!cancelled) setThumb(url);
      });
    }
    return () => { cancelled = true; };
  }, [blob, isZip]);

  return (
    <div className="mt-8 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-violet-500 text-violet-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-neutral-900">Processing Completed!</div>
              <div className="text-sm text-neutral-500">Your {isZip ? 'files are' : 'PDF is'} ready to download.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Start Again
          </button>
        </div>

        <div className="flex items-center gap-4 p-4">
          <div className="grid h-16 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
            {isZip ? (
              <FileArchive className="h-6 w-6 text-amber-500" />
            ) : thumb ? (
              <img src={thumb} alt={filename} className="h-full w-full object-cover object-top" />
            ) : (
              <FileText className="h-6 w-6 text-rose-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-neutral-900">{filename}</div>
            <div className="text-xs text-neutral-500">
              {originalSize ? <>{formatBytes(originalSize)} → </> : null}
              {formatBytes(finalSize)}
              {savedPct !== null && savedPct > 0 && (
                <span className="ml-1 font-medium text-emerald-600">({savedPct}% smaller)</span>
              )}
            </div>
            {note && <div className="mt-0.5 text-xs text-neutral-400">{note}</div>}
          </div>
          <button
            type="button"
            onClick={() => saveBlob(blob, filename)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-bold text-neutral-900">Summary</div>
          <dl className="mt-3 space-y-2 text-sm">
            {originalSize ? <Row label="Original size" value={formatBytes(originalSize)} /> : null}
            <Row label="File size" value={formatBytes(finalSize)} />
            {savedPct !== null && savedPct > 0 && <Row label="Space saved" value={`${savedPct}%`} accent />}
          </dl>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <Users2 className="mx-auto h-8 w-8 text-violet-500" />
          <div className="mt-2 text-sm font-bold text-neutral-900">Love ImageYantra?</div>
          <p className="mt-1 text-xs text-neutral-500">If you found our tool helpful, share it with your friends.</p>
          <button
            type="button"
            onClick={() => navigator.share ? navigator.share({ title: 'ImageYantra', url: window.location.origin }) : null}
            className="mt-3 w-full rounded-lg border border-violet-200 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
          >
            Share Now
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={`font-semibold ${accent ? 'text-emerald-600' : 'text-neutral-900'}`}>{value}</dd>
    </div>
  );
}
