import { useState, useEffect } from 'react';
import { Head } from 'vite-react-ssg';
import { Plus, Trash2, SlidersHorizontal, ArrowRight, Scan, FlipHorizontal, RotateCw, Maximize2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import { readFileAsDataURL, compressToTarget, downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'resize-image',  name: 'Resize Image',  Icon: Maximize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
  { slug: 'rotate-image',  name: 'Rotate Image',  Icon: RotateCw },
];

const COMPRESS_FAQS = [
  {
    q: 'Will compressing reduce my image quality?',
    a: 'A little, depending on how small a target you choose. The tool searches for the highest quality that still fits your target size, so quality loss is kept to the minimum needed.',
  },
  {
    q: 'What happens if I don\u2019t enter a target size?',
    a: 'Your images are compressed automatically to roughly half their original size while keeping the best possible visual quality.',
  },
  {
    q: 'Can I compress multiple images at once?',
    a: 'Yes. Add up to 10 images and the same target size and format settings are applied to all of them in one pass.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: 'No. Compression happens entirely in your browser using the Canvas API \u2014 your files never leave your device.',
  },
];

export default function CompressImagePage() {
  return (
    <>
      <Head>
        <title>Compress Image — ImageYantra</title>
        <meta name="description" content="Compress an JPG, JPEG, PNG or SVG to 20kb, 50kb, 100KB, 200KB, or any other size." />
      </Head>
      <PageShell>
        <ToolShell
          title="Compress"
          titleAccent="IMAGES"
          description="Compress an JPG, JPEG, PNG or SVG to 20kb, 50kb, 100KB, 200KB, or any other size."
          accept="image/*"
          multiple
          maxFiles={10}
          workspaceLayout
          renderResult={(results, api) => (
            <>
              <ToolResult
                items={results}
                onReset={api.reset}
                onDownloadAll={() => results.forEach((r) => downloadNow(r))}
              />
              <ToolResultExtras
                relatedTools={RELATED_TOOLS}
                relatedBlogs={BLOG_POSTS.slice(0, 3)}
                faqs={COMPRESS_FAQS}
                tone="image"
              />
            </>
          )}
        >
          {(files, api) => <CompressWorking files={files} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function downloadNow(item) {
  downloadDataURL(item.downloadUrl, item.name);
}

function CompressWorking({ files, api }) {
  const [targetKB, setTargetKB] = useState('');
  const [format, setFormat] = useState('keep');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });

  async function handleCompress() {
    setBusy(true);
    const results = [];
    for (const file of files) {
      const dataUrl = await readFileAsDataURL(file);
      const origBytes = file.size;
      const target = targetKB ? Number(targetKB) * 1024 : origBytes * 0.5;
      const { dataUrl: outUrl, finalSize } = await compressToTarget(
        { dataUrl, origBytes },
        target,
        (pct, msg) => setProgress({ pct, msg }),
      );
      results.push({
        name: file.name,
        thumb: dataUrl,
        originalSize: origBytes,
        newSize: finalSize,
        downloadUrl: outUrl,
      });
    }
    setBusy(false);
    api.goToResult(results);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">
            Selected Images: <span className="text-violet-600">{String(files.length).padStart(2, '0')}</span>
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
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {files.map((f, i) => (
            <FileThumb key={i} file={f} onRemove={() => api.removeOne(i)} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" /> Compression Settings
          </div>

          <label className="text-xs font-medium text-neutral-600">Target Size (Per IMG)</label>
          <div className="mt-1.5 flex items-center rounded-lg border border-neutral-200 focus-within:border-violet-400">
            <input
              type="number"
              min="1"
              value={targetKB}
              onChange={(e) => setTargetKB(e.target.value)}
              placeholder="Enter Size"
              className="w-full border-none bg-transparent px-3 py-2.5 text-sm outline-none focus:outline-none"
            />
            <span className="pr-3 text-xs font-medium text-neutral-400">KB</span>
          </div>
          <div className="mt-1 text-right text-[11px] text-neutral-400">Example: 100KB</div>

          <label className="mt-4 block text-xs font-medium text-neutral-600">Output Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="mt-1.5 w-full appearance-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          >
            <option value="keep">Keep Original Format</option>
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>

          <div className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            <strong>Note:</strong> If you don't specify a custom file size, your images will be compressed automatically while maintaining the best possible quality.
          </div>

          <button
            type="button"
            onClick={handleCompress}
            disabled={busy || files.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Compressing…') : <>Compress IMAGES <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FileThumb({ file, onRemove }) {
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
