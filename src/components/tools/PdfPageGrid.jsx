import { useState } from 'react';
import { GripVertical, CheckCircle2, Circle } from 'lucide-react';

/**
 * @param {string[]} thumbs        data URLs, one per page, in current order
 * @param {number[]} order         current page-index order (indices into original doc)
 * @param {(order:number[])=>void} [onReorder]   omit to disable drag-reorder
 * @param {Set<number>} [selected] page indices currently selected
 * @param {(idx:number)=>void} [onToggle]        omit to disable click-select
 * @param {string} [selectHint]    label shown under each thumb, e.g. "Tap to remove"
 */
export default function PdfPageGrid({ thumbs, order, onReorder, selected, onToggle, selectHint }) {
  const [dragIdx, setDragIdx] = useState(null);
  const draggable = !!onReorder;
  const selectable = !!onToggle;

  function handleDrop(overPos) {
    if (dragIdx === null || dragIdx === overPos) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(overPos, 0, moved);
    onReorder(next);
    setDragIdx(null);
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {order.map((pageIdx, pos) => {
        const isSelected = selected?.has(pageIdx);
        return (
          <div
            key={pageIdx}
            draggable={draggable}
            onDragStart={() => setDragIdx(pos)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(pos)}
            onClick={() => selectable && onToggle(pageIdx)}
            className={`group relative overflow-hidden rounded-xl border bg-white transition ${
              isSelected ? 'border-violet-500 ring-2 ring-violet-500' : 'border-neutral-200'
            } ${selectable ? 'cursor-pointer' : ''} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            {draggable && (
              <div className="absolute left-1.5 top-1.5 z-10 rounded bg-white/90 p-1 text-neutral-400 shadow">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
            )}
            {selectable && (
              <div className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white/90 p-0.5 shadow">
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-violet-600" />
                ) : (
                  <Circle className="h-4 w-4 text-neutral-300" />
                )}
              </div>
            )}
            <img src={thumbs[pageIdx]} alt={`Page ${pageIdx + 1}`} className="w-full bg-neutral-50 object-contain" />
            <div className={`flex items-center justify-between px-2 py-1 text-[11px] ${isSelected ? 'bg-violet-50 text-violet-700' : 'bg-white text-neutral-500'}`}>
              <span>Page {pageIdx + 1}</span>
              {selectable && isSelected && selectHint && <span className="font-medium">{selectHint}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
