import { useEffect, useState } from 'react';
import { Head } from 'vite-react-ssg';
import {
  ArrowRight, FlipHorizontal, FlipVertical, Combine, RotateCcw,
  Eye, EyeOff, ZoomIn, ZoomOut, Scan, Maximize2, Trash2, Minimize2, RotateCw,
} from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import {
  readFileAsDataURL, loadImage, rotateFlipImage, dataURLSize,
  downloadDataURL, formatBytes, fileFormatLabel,
} from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const ZOOM_MIN = 25;
const ZOOM_MAX = 400;
const ZOOM_STEP = 25;

const RELATED_TOOLS = [
  { slug: 'rotate-image', name: 'Rotate Image', Icon: RotateCw },
  { slug: 'crop-image', name: 'Crop Image', Icon: Scan },
  { slug: 'resize-image', name: 'Resize Image', Icon: Maximize2 },
  { slug: 'compress-image', name: 'Compress Image', Icon: Minimize2 },
];

const FLIP_FAQS = [
  {
    q: 'What\u2019s the difference between flipping and rotating?',
    a: 'Flipping mirrors the image across an axis \u2014 left becomes right (horizontal) or top becomes bottom (vertical). Rotating spins the whole image around its center instead. They\u2019re different operations, so Rotate Image is a separate tool.',
  },
  {
    q: 'Can I flip an image both horizontally and vertically at once?',
    a: 'Yes. Turn on both Horizontal and Vertical, or use the single "Flip Both" shortcut \u2014 the result is identical to a 180\u00b0 rotation.',
  },
  {
    q: 'Does zooming in the preview affect the downloaded file?',
    a: 'No. Zoom, Fit to Screen and Before/After are preview-only controls to help you inspect the image \u2014 the exported file always uses the image\u2019s full original resolution.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: 'No. Flipping happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.',
  },
];

export default function FlipImagePage() {
  return (
    <>
      <Head>
        <title>Flip Image — ImageYantra</title>
        <meta name="description" content="Flip an image horizontally or vertically, right in your browser." />
      </Head>
      <PageShell>
        <ToolShell
          title="Flip"
          titleAccent="IMAGE"
          description="Mirror your image horizontally or vertically."
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
                faqs={FLIP_FAQS}
                tone="image"
              />
            </>
          )}
        >
          {(files, api) => <FlipWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function FlipWorking({ file, api }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoomPct, setZoomPct] = useState(null); // null = Fit to Screen
  const [showOriginal, setShowOriginal] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(async (url) => {
      setDataUrl(url);
      const img = await loadImage(url);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    });
  }, [file]);

  const bothActive = flipH && flipV;
  const noFlip = !flipH && !flipV;

  function toggleFlipBoth() {
    if (bothActive) { setFlipH(false); setFlipV(false); }
    else { setFlipH(true); setFlipV(true); }
  }

  function resetFlip() { setFlipH(false); setFlipV(false); }

  function zoomIn() { setZoomPct((z) => Math.min(ZOOM_MAX, (z ?? 100) + ZOOM_STEP)); }
  function zoomOut() { setZoomPct((z) => Math.max(ZOOM_MIN, (z ?? 100) - ZOOM_STEP)); }
  function fitToScreen() { setZoomPct(null); }
  function actualSize() { setZoomPct(100); }

  async function handleFlip() {
    if (!dataUrl) return;
    setBusy(true);
    const { dataUrl: outUrl } = await rotateFlipImage(dataUrl, { flipH, flipV });
    setBusy(false);
    api.goToResult([{
      name: file.name.replace(/\.\w+$/, '') + '-flipped.jpg',
      thumb: outUrl,
      originalSize: file.size,
      newSize: dataURLSize(outUrl),
      downloadUrl: outUrl,
      dims: naturalSize.w ? `${naturalSize.w} × ${naturalSize.h} px` : undefined,
    }]);
  }

  const transformStr = showOriginal ? 'none' : `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;
  const zoomedImgStyle = zoomPct
    ? { width: naturalSize.w ? naturalSize.w * (zoomPct / 100) : undefined, maxWidth: 'none', transform: transformStr }
    : { maxHeight: 420, maxWidth: '100%', transform: transformStr };

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
          <div
            className={`mx-auto overflow-auto rounded-xl bg-neutral-100 ${
              zoomPct ? 'flex items-start justify-start p-4' : 'flex min-h-[320px] items-center justify-center'
            }`}
            style={{ height: 420 }}
          >
            <img
              src={dataUrl}
              alt="preview"
              className="block w-auto select-none object-contain transition-transform duration-150"
              style={zoomedImgStyle}
              draggable={false}
            />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <span>{showOriginal ? 'Showing original (before)' : 'Showing preview (after)'}</span>
          <span>{zoomPct ? `${zoomPct}% zoom` : 'Fit to screen'}</span>
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <FlipHorizontal className="h-4 w-4 text-violet-600" /> Flip Settings
          </div>

          {/* ── Flip actions ─────────────────────────── */}
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Flip</div>
          <div className="grid grid-cols-2 gap-2">
            <ToggleBtn active={flipH} onClick={() => setFlipH((v) => !v)} Icon={FlipHorizontal} label="Horizontal" />
            <ToggleBtn active={flipV} onClick={() => setFlipV((v) => !v)} Icon={FlipVertical} label="Vertical" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ToggleBtn active={bothActive} onClick={toggleFlipBoth} Icon={Combine} label="Flip Both" />
            <button
              type="button"
              onClick={resetFlip}
              disabled={noFlip}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 py-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>

          <div className="my-4 border-t border-neutral-100" />

          {/* ── Preview controls ─────────────────────── */}
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Preview</div>
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium ${
              showOriginal ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {showOriginal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showOriginal ? 'Viewing Original' : 'Before / After'}
          </button>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={zoomOut}
              disabled={(zoomPct ?? 100) <= ZOOM_MIN}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ZoomOut className="h-4 w-4" /> Zoom Out
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={(zoomPct ?? 100) >= ZOOM_MAX}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ZoomIn className="h-4 w-4" /> Zoom In
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ToggleBtn active={zoomPct === null} onClick={fitToScreen} Icon={Scan} label="Fit to Screen" />
            <ToggleBtn active={zoomPct === 100} onClick={actualSize} Icon={Maximize2} label="Actual Size" />
          </div>

          <div className="my-4 border-t border-neutral-100" />

          {/* ── Image info ────────────────────────────── */}
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Image Info</div>
          <dl className="space-y-1.5 text-xs">
            <InfoRow label="Dimensions" value={naturalSize.w ? `${naturalSize.w} × ${naturalSize.h} px` : '—'} />
            <InfoRow label="File Size" value={formatBytes(file?.size)} />
            <InfoRow label="Format" value={fileFormatLabel(file)} />
          </dl>

          <button
            type="button"
            onClick={handleFlip}
            disabled={busy || !dataUrl || noFlip}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Flipping…' : <>Flip IMAGE <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({ active, onClick, Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium ${
        active ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-800">{value}</dd>
    </div>
  );
}
