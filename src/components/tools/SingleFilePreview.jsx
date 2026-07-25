import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Main workspace area for tools that only ever process one file
 * (Flip, Rotate, Resize, Background Remove, etc.). Same card shell as
 * BatchFileGrid so the overall page balance stays the same — only the
 * preview itself gets more room, since there's no thumbnail grid to fill
 * that space with.
 */
export default function SingleFilePreview({ file, api }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
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
      {url && (
        <div className="mx-auto flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
          <img src={url} alt={file?.name} className="max-h-[520px] w-auto max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
