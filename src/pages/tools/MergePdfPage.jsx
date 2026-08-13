import { useState } from 'react';
import { Head } from 'vite-react-ssg';
import { Plus, Trash2, ArrowRight, GripVertical, FileText } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import { mergePdfs, formatBytes } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'split-pdf',     name: 'Split PDF',     Icon: iconForSlug('split-pdf', PDF_TOOLS) },
  { slug: 'arrange-pdf',   name: 'Arrange PDF',   Icon: iconForSlug('arrange-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf',  name: 'Compress PDF',  Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'Will merging change the quality of my PDFs?', a: 'No — pages are copied exactly as they are (text stays selectable, images stay full quality). No rasterizing happens unless a source file is already very large.' },
  { q: 'Why is the output always a small file size?', a: 'We losslessly compact the merged file (deduplicated structure, compressed cross-reference streams). Only if a source PDF already contains huge scanned images and the merged file would still exceed 1MB do we apply one automatic high-quality pass to bring it under that size.' },
  { q: 'Can I change the order the files are merged in?', a: 'Yes — drag the file cards to reorder them before merging.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Merging happens entirely in your browser — your files never leave your device.' },
];

export default function MergePdfPage() {
  return (
    <>
      <Head>
        <title>Merge PDF — ImageYantra</title>
        <meta name="description" content="Combine multiple PDF files into a single document, free and in your browser." />
      </Head>
      <PageShell>
        <ToolShell
          title="Merge"
          titleAccent="PDF"
          description="Combine multiple PDF files into one, in the order you choose."
          accept="application/pdf"
          multiple
          maxFiles={20}
          fileNoun="PDF"
          renderResult={(result, api) => (
            <>
              <PdfResult
                blob={result.blob}
                filename="merged.pdf"
                originalSize={result.originalSize}
                note={result.rasterized ? 'Automatically optimized to fit the size target.' : undefined}
                onReset={api.reset}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <MergeWorking files={files} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function MergeWorking({ files, api }) {
  // Track order as the actual File objects, not positional indices — this
  // stays correct no matter where a file is added or removed from the
  // underlying `files` array (indices shift on removal, references don't).
  const [order, setOrder] = useState(files);
  const [dragIdx, setDragIdx] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });

  // Keep order in sync with the incoming files: drop any that were removed,
  // append any newly added ones, while preserving the user's chosen order
  // for everything that's still present.
  const orderIsStale = order.length !== files.length || order.some((f) => !files.includes(f));
  if (orderIsStale) {
    const stillPresent = order.filter((f) => files.includes(f));
    const newlyAdded = files.filter((f) => !stillPresent.includes(f));
    setOrder([...stillPresent, ...newlyAdded]);
  }

  function handleDrop(overPos) {
    if (dragIdx === null || dragIdx === overPos) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(overPos, 0, moved);
    setOrder(next);
    setDragIdx(null);
  }

  async function handleMerge() {
    setBusy(true);
    const orderedFiles = order;
    const originalSize = orderedFiles.reduce((s, f) => s + f.size, 0);
    const result = await mergePdfs(orderedFiles, (pct, msg) => setProgress({ pct, msg }));
    setBusy(false);
    api.goToResult({ ...result, originalSize });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">
            {files.length} PDF{files.length !== 1 ? 's' : ''} selected — drag to reorder
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={api.addMore} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
              <Plus className="h-3.5 w-3.5" /> Add More
            </button>
            <button type="button" onClick={api.removeAll} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
              <Trash2 className="h-3.5 w-3.5" /> Remove All
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {order.map((file, pos) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}-${pos}`}
              draggable
              onDragStart={() => setDragIdx(pos)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(pos)}
              className="flex cursor-grab items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-neutral-400" />
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-500">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-neutral-900">{file.name}</div>
                <div className="text-xs text-neutral-500">{formatBytes(file.size)}</div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-violet-600">#{pos + 1}</span>
              <button
                type="button"
                onClick={() => api.removeOne(files.indexOf(file))}
                className="shrink-0 rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-bold text-neutral-900">Merge PDFs</div>
          <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Pages are copied exactly — no rasterizing, no quality loss. Output is compacted to stay under 500KB whenever the source content allows.
          </div>
          <button
            type="button"
            onClick={handleMerge}
            disabled={busy || files.length < 2}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Merging…') : <>Merge {files.length} PDFs <ArrowRight className="h-4 w-4" /></>}
          </button>
          {files.length < 2 && <p className="mt-2 text-center text-xs text-neutral-400">Add at least 2 PDFs to merge.</p>}
        </div>
      </div>
    </div>
  );
}