import { useEffect, useState } from 'react';
import { Head } from 'vite-react-ssg';
import { ArrowRight, RotateCcw, RotateCw, Trash2, FlipHorizontal, Scan, Maximize2, Minimize2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import { readFileAsDataURL, rotateFlipImage, dataURLSize, downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'resize-image',  name: 'Resize Image',  Icon: Maximize2 },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
];

const ROTATE_FAQS = [
  {
    q: 'Can I rotate by an exact custom angle, not just 90°?',
    a: 'Yes. Drag the Custom Angle slider to dial in any angle between -180° and 180°, in addition to the quick 90° left/right buttons.',
  },
  {
    q: 'Will rotating crop or cut off parts of my image?',
    a: 'No. The canvas automatically expands to fit the fully rotated image, so nothing gets clipped \u2014 any new empty corners are simply transparent or white depending on the source format.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: 'No. Rotation happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.',
  },
];

export default function RotateImagePage() {
  return (
    <>
      <Head>
        <title>Rotate Image — ImageYantra</title>
        <meta name="description" content="Rotate an image by 90°, 180°, 270° or any custom angle." />
      </Head>
      <PageShell>
        <ToolShell
          title="Rotate"
          titleAccent="IMAGE"
          description="Rotate by 90° steps or dial in a custom angle."
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
                faqs={ROTATE_FAQS}
                tone="image"
              />
            </>
          )}
        >
          {(files, api) => <RotateWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function RotateWorking({ file, api }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [angle, setAngle] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(setDataUrl);
  }, [file]);

  async function handleRotate() {
    if (!dataUrl) return;
    setBusy(true);
    const { dataUrl: outUrl } = await rotateFlipImage(dataUrl, { angle, expand: true });
    setBusy(false);
    api.goToResult([{
      name: file.name.replace(/\.\w+$/, '') + '-rotated.jpg',
      thumb: outUrl,
      originalSize: file.size,
      newSize: dataURLSize(outUrl),
      downloadUrl: outUrl,
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
            <img
              src={dataUrl}
              alt="preview"
              className="max-h-[420px] w-auto max-w-[80%] object-contain transition-transform"
              style={{ transform: `rotate(${angle}deg)` }}
            />
          </div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <RotateCw className="h-4 w-4 text-violet-600" /> Rotate Settings
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAngle((a) => a - 90)}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 py-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4" /> Rotate Left
            </button>
            <button
              type="button"
              onClick={() => setAngle((a) => a + 90)}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 py-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <RotateCw className="h-4 w-4" /> Rotate Right
            </button>
          </div>

          <label className="mt-4 block text-xs font-medium text-neutral-600">Custom Angle</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min="-180"
              max="180"
              value={angle % 360}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <span className="w-14 shrink-0 text-right text-xs font-semibold text-neutral-700">{angle}°</span>
          </div>

          {angle !== 0 && (
            <button
              type="button"
              onClick={() => setAngle(0)}
              className="mt-2 text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              Reset to 0°
            </button>
          )}

          <button
            type="button"
            onClick={handleRotate}
            disabled={busy || !dataUrl || angle === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Rotating…' : <>Rotate IMAGE <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
