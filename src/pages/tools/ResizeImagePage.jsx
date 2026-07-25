import { useEffect, useRef, useState } from 'react';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Maximize2, Link2, Unlink, Trash2, Scan, FlipHorizontal, RotateCw, Minimize2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import { readFileAsDataURL, loadImage, resizeImage, dataURLSize, downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
  { slug: 'rotate-image',  name: 'Rotate Image',  Icon: RotateCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
];

const RESIZE_FAQS = [
  {
    q: 'Will resizing distort my image?',
    a: 'Only if you unlock the aspect ratio and pick a width/height combination that doesn\u2019t match the original proportions. Keep the ratio locked to resize safely.',
  },
  {
    q: 'Can I make an image larger than its original size?',
    a: 'Yes, but upscaling beyond the original resolution can soften detail since no new information is created \u2014 it works best for modest increases.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: 'No. Resizing happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.',
  },
];

export default function ResizeImagePage() {
  return (
    <>
      <Head>
        <title>Resize Image — ImageYantra</title>
        <meta name="description" content="Resize an image to an exact width and height, with optional aspect-ratio lock." />
      </Head>
      <PageShell>
        <ToolShell
          title="Resize"
          titleAccent="IMAGE"
          description="Set an exact pixel width and height, or lock the aspect ratio."
          accept="image/*"
          multiple={false}
          maxFiles={1}
          renderResult={(results, api) => (
            <>
              <ToolResult
                items={results}
                onReset={api.reset}
                showDownloadAll={false}
                onDownloadAll={() => results.forEach((r) => downloadDataURL(r.downloadUrl, r.name))}
              />
              <ToolResultExtras
                relatedTools={RELATED_TOOLS}
                relatedBlogs={BLOG_POSTS.slice(0, 3)}
                faqs={RESIZE_FAQS}
                tone="image"
              />
            </>
          )}
        >
          {(files, api) => <ResizeWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function ResizeWorking({ file, api }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [locked, setLocked] = useState(true);
  const [busy, setBusy] = useState(false);
  const ratioRef = useRef(1);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(async (url) => {
      setDataUrl(url);
      const img = await loadImage(url);
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      ratioRef.current = img.naturalWidth / img.naturalHeight;
    });
  }, [file]);

  function onWidthChange(v) {
    setWidth(v);
    if (locked && v) setHeight(Math.round(Number(v) / ratioRef.current));
  }
  function onHeightChange(v) {
    setHeight(v);
    if (locked && v) setWidth(Math.round(Number(v) * ratioRef.current));
  }

  async function handleResize() {
    if (!dataUrl || !width || !height) return;
    setBusy(true);
    const outUrl = await resizeImage(dataUrl, Number(width), Number(height));
    setBusy(false);
    api.goToResult([{
      name: file.name.replace(/\.\w+$/, '') + '-resized.jpg',
      thumb: outUrl,
      originalSize: file.size,
      newSize: dataURLSize(outUrl),
      downloadUrl: outUrl,
      dims: `${width} × ${height} px`,
    }]);
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
        {dataUrl && (
          <div className="mx-auto flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
            <img src={dataUrl} alt="preview" className="max-h-[520px] w-auto max-w-full object-contain" />
          </div>
        )}
        {natural.w > 0 && (
          <div className="mt-3 text-center text-xs text-neutral-500">
            Original: {natural.w} × {natural.h} px
          </div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Maximize2 className="h-4 w-4 text-violet-600" /> Resize Settings
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-600">Width</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => onWidthChange(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">Height</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => onHeightChange(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-violet-700"
          >
            {locked ? <Link2 className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
            {locked ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
          </button>

          <div className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Unlock the ratio to stretch width and height independently.
          </div>

          <button
            type="button"
            onClick={handleResize}
            disabled={busy || !dataUrl || !width || !height}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Resizing…' : <>Resize IMAGE <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
