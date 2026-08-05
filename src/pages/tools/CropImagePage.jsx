import { useEffect, useRef, useState } from 'react';
import { Head } from 'vite-react-ssg';
import {
  ArrowRight, Crop as CropIcon, Lock, Unlock,
  Minimize2, Maximize2, RotateCw, Eraser,
} from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import { readFileAsDataURL, loadImage, cropImage, dataURLSize } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

/* `value`: null = Free crop, 'original' = match the source image's own
   ratio (resolved once natural size is known), otherwise a width/height number. */
const ASPECTS = [
  { label: 'Free',     value: null },
  { label: 'Original', value: 'original' },
  { label: '1:1',      value: 1 },
  { label: '4:5',      value: 4 / 5 },
  { label: '3:4',      value: 3 / 4 },
  { label: '4:3',      value: 4 / 3 },
  { label: '3:2',      value: 3 / 2 },
  { label: '2:3',      value: 2 / 3 },
  { label: '16:9',     value: 16 / 9 },
  { label: '9:16',     value: 9 / 16 },
  { label: 'A4',       value: 210 / 297 },
  { label: 'YouTube',  value: 16 / 9 },
];

/** Resolve an ASPECTS entry to a numeric ratio (or null for Free). */
function ratioOf(aspect, naturalSize) {
  if (!aspect || aspect.value == null) return null;
  if (aspect.value === 'original') {
    return naturalSize.h ? naturalSize.w / naturalSize.h : null;
  }
  return aspect.value;
}

const RELATED_TOOLS = [
  { slug: 'resize-image',  name: 'Resize Image',  Icon: Maximize2 },
  { slug: 'rotate-image',  name: 'Rotate Image',  Icon: RotateCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'background-remove', name: 'Background Remove', Icon: Eraser },
];

const CROP_FAQS = [
  {
    q: 'Will cropping reduce my image quality?',
    a: 'No. Cropping only removes pixels outside your selection — the pixels you keep stay at their original resolution and quality.',
  },
  {
    q: 'Can I crop to an exact aspect ratio like 4:5 or 16:9?',
    a: 'Yes. Pick any ratio from the Aspect Ratio list and the crop box will lock to it while you drag or resize.',
  },
  {
    q: 'What does the "Original" ratio option do?',
    a: 'It locks the crop box to your source image\'s own width-to-height ratio, so you can crop in from the edges without distorting the shape.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: 'No. Cropping happens entirely in your browser using the Canvas API — your file never leaves your device.',
  },
];

export default function CropImagePage() {
  return (
    <>
      <Head>
        <title>Crop Image — ImageYantra</title>
        <meta name="description" content="Drag to select any region of your image, or lock a preset aspect ratio." />
      </Head>
      <PageShell>
        <ToolShell
          title="Crop"
          titleAccent="IMAGE"
          description="Drag to select any region. Choose a preset ratio or crop completely freely."
          accept="image/*"
          multiple={false}
          maxFiles={1}
          renderResult={(results, api) => (
            <>
              <ToolResult
                items={results}
                onReset={api.reset}
                showDownloadAll={false}
                onDownloadAll={() => results.forEach((r) => {
                  const a = document.createElement('a'); a.href = r.downloadUrl; a.download = r.name; a.click();
                })}
              />
              <ToolResultExtras
                relatedTools={RELATED_TOOLS}
                relatedBlogs={BLOG_POSTS.slice(0, 3)}
                faqs={CROP_FAQS}
                tone="image"
              />
            </>
          )}
        >
          {(files, api) => <CropWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function CropWorking({ file, api }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 40, y: 40, w: 220, h: 220 });
  const [aspect, setAspect] = useState(ASPECTS[0]); // Free by default
  const [busy, setBusy] = useState(false);
  const imgRef = useRef(null);
  const dragRef = useRef(null);

  const ratio = ratioOf(aspect, naturalSize);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(async (url) => {
      setDataUrl(url);
      const img = await loadImage(url);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    });
  }, [file]);

  /** Centers a ratio-locked crop box inside the current image element. */
  function centerBoxForRatio(r) {
    const el = imgRef.current;
    if (!el || !r) return;
    let w = Math.min(el.clientWidth * 0.8, el.clientHeight * 0.8 * r);
    let h = w / r;
    if (h > el.clientHeight * 0.9) { h = el.clientHeight * 0.8; w = h * r; }
    if (w > el.clientWidth * 0.9) { w = el.clientWidth * 0.8; h = w / r; }
    setBox({ x: (el.clientWidth - w) / 2, y: (el.clientHeight - h) / 2, w, h });
  }

  function onImgLoad() {
    const el = imgRef.current;
    if (!el) return;
    if (ratio) {
      centerBoxForRatio(ratio);
      return;
    }
    const w = Math.min(260, el.clientWidth * 0.6);
    const h = Math.min(260, el.clientHeight * 0.6);
    setBox({
      x: (el.clientWidth - w) / 2,
      y: (el.clientHeight - h) / 2,
      w, h,
    });
  }

  function handleAspectSelect(a) {
    setAspect(a);
    const r = ratioOf(a, naturalSize);
    if (r) centerBoxForRatio(r);
    // Free (r === null) intentionally leaves the current box untouched.
  }

  function clamp(b, el) {
    let { x, y, w, h } = b;
    w = Math.max(30, Math.min(w, el.clientWidth));
    h = Math.max(30, Math.min(h, el.clientHeight));
    x = Math.max(0, Math.min(x, el.clientWidth - w));
    y = Math.max(0, Math.min(y, el.clientHeight - h));
    return { x, y, w, h };
  }

  function startDrag(mode, e) {
    e.preventDefault();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startBox: { ...box } };
    window.addEventListener('pointermove', onDrag);
    window.addEventListener('pointerup', stopDrag);
  }

  function onDrag(e) {
    const el = imgRef.current;
    if (!el || !dragRef.current) return;
    const { mode, startX, startY, startBox } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let next = { ...startBox };

    if (mode === 'move') {
      next.x = startBox.x + dx;
      next.y = startBox.y + dy;
    } else {
      if (mode.includes('e')) next.w = startBox.w + dx;
      if (mode.includes('s')) next.h = startBox.h + dy;
      if (mode.includes('w')) { next.w = startBox.w - dx; next.x = startBox.x + dx; }
      if (mode.includes('n')) { next.h = startBox.h - dy; next.y = startBox.y + dy; }
      if (ratio) next.h = next.w / ratio;
    }
    setBox(clamp(next, el));
  }

  function stopDrag() {
    dragRef.current = null;
    window.removeEventListener('pointermove', onDrag);
    window.removeEventListener('pointerup', stopDrag);
  }

  async function handleCrop() {
    if (!imgRef.current || !dataUrl) return;
    setBusy(true);
    const el = imgRef.current;
    const scaleX = naturalSize.w / el.clientWidth;
    const scaleY = naturalSize.h / el.clientHeight;
    const region = {
      x: box.x * scaleX,
      y: box.y * scaleY,
      w: box.w * scaleX,
      h: box.h * scaleY,
    };
    const outUrl = await cropImage(dataUrl, region);
    setBusy(false);
    api.goToResult([{
      name: file.name.replace(/\.\w+$/, '') + '-cropped.jpg',
      thumb: outUrl,
      originalSize: file.size,
      newSize: dataURLSize(outUrl),
      downloadUrl: outUrl,
      dims: `${Math.round(region.w)} × ${Math.round(region.h)} px`,
    }]);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 text-sm font-semibold text-neutral-900">{file?.name}</div>
        {dataUrl && (
          <div
            ref={imgRef}
            className="relative mx-auto w-fit max-h-[420px] max-w-full select-none overflow-hidden rounded-xl bg-neutral-100"
            style={{ touchAction: 'none' }}
          >
            <img
              src={dataUrl}
              alt="to crop"
              onLoad={onImgLoad}
              className="block max-h-[420px] w-auto max-w-full select-none"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/40" style={{
              clipPath: `polygon(0 0, 0 100%, ${box.x}px 100%, ${box.x}px ${box.y}px, ${box.x + box.w}px ${box.y}px, ${box.x + box.w}px ${box.y + box.h}px, ${box.x}px ${box.y + box.h}px, ${box.x}px 100%, 100% 100%, 100% 0)`,
            }} />
            <div
              onPointerDown={(e) => startDrag('move', e)}
              className="absolute cursor-move border-2 border-violet-500"
              style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
            >
              {['nw', 'ne', 'sw', 'se'].map((corner) => (
                <div
                  key={corner}
                  onPointerDown={(e) => { e.stopPropagation(); startDrag(corner, e); }}
                  className="absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-violet-600"
                  style={{
                    top: corner.includes('n') ? -7 : undefined,
                    bottom: corner.includes('s') ? -7 : undefined,
                    left: corner.includes('w') ? -7 : undefined,
                    right: corner.includes('e') ? -7 : undefined,
                    cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <CropIcon className="h-4 w-4 text-violet-600" /> Crop Settings
          </div>

          <label className="text-xs font-medium text-neutral-600">Aspect Ratio</label>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => handleAspectSelect(a)}
                className={`rounded-lg border px-1 py-1.5 text-[11px] font-medium leading-tight ${
                  aspect.label === a.label ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
            {ratio ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            {ratio ? 'Ratio locked — drag corners to resize' : 'Free crop — drag corners or move the box'}
          </div>

          <div className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Selection: {Math.round(box.w)} × {Math.round(box.h)} px (on screen)
          </div>

          <button
            type="button"
            onClick={handleCrop}
            disabled={busy || !dataUrl}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Cropping…' : <>Crop IMAGE <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}