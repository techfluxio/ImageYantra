import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function FileThumb({ file, onRemove }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-200">
      {url && <img src={url} alt={file.name} className="aspect-[3/4] w-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow group-hover:flex"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <div className="truncate bg-white px-2 py-1 text-[11px] text-neutral-600">{file.name}</div>
    </div>
  );
}
