import { SlidersHorizontal, Info } from 'lucide-react';

export default function GenericToolSettings({ toolName, actionLabel }) {
  return (
    <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
          <SlidersHorizontal className="h-4 w-4 text-violet-600" /> {toolName} Settings
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{toolName} processing is being finalized. Your file is staged and ready — check back shortly for the full working tool.</span>
        </div>

        <button
          type="button"
          disabled
          className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-violet-300 py-3 text-sm font-semibold text-white"
        >
          {actionLabel || toolName}
        </button>
      </div>
    </div>
  );
}
