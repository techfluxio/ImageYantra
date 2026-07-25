import { CheckCircle2, Download, RotateCcw, Users2, AlertTriangle } from 'lucide-react';
import { downloadDataURL } from '../../utils/imageProcessing.js';

export default function ToolResult({ items = [], onReset, onDownloadAll, showDownloadAll = true }) {
  const totalOriginal = items.reduce((s, i) => s + (i.originalSize || 0), 0);
  const totalNew = items.reduce((s, i) => s + (i.newSize || 0), 0);
  const savedPct = totalOriginal ? Math.round((1 - totalNew / totalOriginal) * 100) : 0;

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
              <div className="text-sm text-neutral-500">Your files are ready to download.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Start Again
            </button>
            {showDownloadAll && (
              <button
                type="button"
                onClick={onDownloadAll}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Download className="h-3.5 w-3.5" /> Download All
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <img src={item.thumb} alt={item.name} className="h-14 w-14 rounded-lg object-cover ring-1 ring-neutral-200" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">{item.name}</div>
                <div className="text-xs text-neutral-500">
                  {item.dims && <>{item.dims} · </>}
                  {formatBytes(item.originalSize)} → {formatBytes(item.newSize)}
                  {item.originalSize > 0 && (
                    <span className="ml-1 font-medium text-emerald-600">
                      ({Math.round((1 - item.newSize / item.originalSize) * 100)}% smaller)
                    </span>
                  )}
                </div>
                {item.belowMin && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                    <AlertTriangle className="h-3 w-3" /> Below the minimum required file size — some portals may reject very small files.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => downloadDataURL(item.downloadUrl, item.name)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-bold text-neutral-900">Summary</div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Total files" value={items.length} />
            <Row label="Original size" value={formatBytes(totalOriginal)} />
            <Row label="New size" value={formatBytes(totalNew)} />
            <Row label="Space saved" value={`${savedPct}%`} accent />
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

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
