import { Plus, Trash2 } from 'lucide-react';
import FileThumb from './FileThumb.jsx';

/** Main workspace area for tools that process multiple files at once. */
export default function BatchFileGrid({ files, api, noun = 'Files' }) {
  return (
    <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-900">
          Selected {noun}: <span className="text-violet-600">{String(files.length).padStart(2, '0')}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={api.addMore}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add More
          </button>
          <button
            type="button"
            onClick={api.removeAll}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove All
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {files.map((f, i) => (
          <FileThumb key={i} file={f} onRemove={() => api.removeOne(i)} />
        ))}
      </div>
    </div>
  );
}
