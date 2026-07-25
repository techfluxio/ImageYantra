import { useMemo, useState } from 'react';
import { CheckCircle2, Download, RotateCcw, Users2, Palette, Check } from 'lucide-react';
import { downloadDataURL, formatBytes, loadImage } from '../../utils/imageProcessing.js';

const CHECKER_BG = {
  backgroundImage:
    'linear-gradient(45deg,#e5e5ea 25%,transparent 25%),linear-gradient(-45deg,#e5e5ea 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5ea 75%),linear-gradient(-45deg,transparent 75%,#e5e5ea 75%)',
  backgroundSize: '22px 22px',
  backgroundPosition: '0 0,0 11px,11px -11px,-11px 0',
};

/* Popular background colours — a mix of studio / passport-photo /
   social-friendly tones, plus "Transparent" as the original state. */
const COLOR_SWATCHES = [
  { name: 'Transparent', value: null },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Passport Blue', value: '#3B7DD8' },
  { name: 'Sky Blue', value: '#7EC8E3' },
  { name: 'Studio Grey', value: '#B0B3B8' },
  { name: 'Cream', value: '#FDF6E3' },
  { name: 'Red', value: '#E53935' },
  { name: 'Forest Green', value: '#2E7D32' },
  { name: 'Blush Pink', value: '#F4A6C1' },
];

export default function BgRemoveResult({ item, onReset }) {
  const [bgColor, setBgColor] = useState(null); // null = transparent / checkerboard
  const [customColor, setCustomColor] = useState('#3B7DD8');
  const [dims, setDims] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const previewStyle = useMemo(
    () => (bgColor ? { backgroundColor: bgColor } : CHECKER_BG),
    [bgColor],
  );

  async function handleDownload() {
    if (!item) return;
    setDownloading(true);
    try {
      if (!bgColor) {
        // Still transparent — no need to composite, just save the PNG as-is.
        downloadDataURL(item.downloadUrl, item.name);
        return;
      }
      const img = await loadImage(item.downloadUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const outUrl = canvas.toDataURL('image/png');
      const baseName = item.name.replace(/\.\w+$/, '');
      downloadDataURL(outUrl, `${baseName}-bg${bgColor}.png`.replace('#', ''));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-violet-500 text-violet-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-neutral-900">Background Removed!</div>
              <div className="text-sm text-neutral-500">Pick a background colour, then download.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Start Again
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" /> {downloading ? 'Preparing…' : 'Download'}
            </button>
          </div>
        </div>

        {/* Large live preview */}
        <div className="p-5">
          <div className="flex justify-center">
            <div className="inline-block overflow-hidden rounded-xl" style={previewStyle}>
              <img
                src={item?.thumb}
                alt={item?.name}
                onLoad={(e) => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                className="block max-h-[70vh] max-w-full object-contain"
              />
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-neutral-500">
            {dims ? `${dims.w} × ${dims.h}px · ` : ''}
            {formatBytes(item?.originalSize)} → {formatBytes(item?.newSize)}
          </div>
        </div>

        {/* Background colour picker — updates the preview instantly */}
        <div className="border-t border-neutral-100 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Palette className="h-4 w-4 text-violet-600" /> Background Colour
          </div>
          <div className="flex flex-wrap gap-3">
            {COLOR_SWATCHES.map((c) => {
              const active = bgColor === c.value;
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => setBgColor(c.value)}
                  className={`relative grid h-10 w-10 place-items-center rounded-full border-2 transition ${
                    active ? 'border-violet-600 scale-110' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  style={c.value ? { backgroundColor: c.value } : CHECKER_BG}
                >
                  {active && (
                    <Check
                      className="h-4 w-4"
                      style={{ color: c.value && isLight(c.value) ? '#111' : '#fff' }}
                    />
                  )}
                </button>
              );
            })}

            {/* Custom colour picker */}
            <label
              title="Custom colour"
              className={`relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border-2 transition ${
                bgColor === customColor ? 'border-violet-600 scale-110' : 'border-neutral-200 hover:border-neutral-300'
              }`}
              style={{ backgroundColor: customColor }}
            >
              {bgColor === customColor && (
                <Check className="h-4 w-4" style={{ color: isLight(customColor) ? '#111' : '#fff' }} />
              )}
              <input
                type="color"
                value={customColor}
                onInput={(e) => {
                  setCustomColor(e.target.value);
                  setBgColor(e.target.value);
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Everything updates live in the preview above. Downloading with a colour selected bakes it into a new PNG —
            pick “Transparent” to get the original see-through PNG back.
          </p>
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-sm font-bold text-neutral-900">Summary</div>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="File name" value={item?.name} truncate />
            <Row label="Dimensions" value={dims ? `${dims.w} × ${dims.h}` : '—'} />
            <Row label="Original size" value={formatBytes(item?.originalSize)} />
            <Row label="Output size" value={formatBytes(item?.newSize)} />
            <Row label="Background" value={bgColor ? bgColor.toUpperCase() : 'Transparent'} accent />
          </dl>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
          <Users2 className="mx-auto h-8 w-8 text-violet-500" />
          <div className="mt-2 text-sm font-bold text-neutral-900">Love ImageYantra?</div>
          <p className="mt-1 text-xs text-neutral-500">If you found our tool helpful, share it with your friends.</p>
          <button
            type="button"
            onClick={() => (navigator.share ? navigator.share({ title: 'ImageYantra', url: window.location.origin }) : null)}
            className="mt-3 w-full rounded-lg border border-violet-200 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
          >
            Share Now
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent, truncate }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-neutral-500">{label}</dt>
      <dd className={`min-w-0 font-semibold ${truncate ? 'truncate' : ''} ${accent ? 'text-emerald-600' : 'text-neutral-900'}`}>
        {value}
      </dd>
    </div>
  );
}

/** Rough luminance check so the check-mark icon stays readable on any swatch. */
function isLight(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}
