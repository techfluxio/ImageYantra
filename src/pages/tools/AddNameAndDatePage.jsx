import { useEffect, useRef, useState } from 'react';
import { Head } from 'vite-react-ssg';
import { Trash2, SlidersHorizontal } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import { readFileAsDataURL, loadImage, downloadDataURL, formatBytes } from '../../utils/imageProcessing.js';

const BANNER_PRESETS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Blue', value: '#1d4ed8' },
  { label: 'Black', value: '#111827' },
  { label: 'Green', value: '#15803d' },
];

const NAME_STYLE = { font: 'Arial, sans-serif', sizeScale: 1.35, bold: true, color: '#111827' };
const DATE_STYLE = { font: 'Arial, sans-serif', sizeScale: 1.5, bold: false, color: '#111827' };

/** DD-MM-YYYY, matching the sample label style. */
function formatLabelDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}-${m}-${y}`;
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Draws the uploaded photo onto a canvas at its natural resolution
 * (capped so huge phone photos don't produce multi-megabyte output),
 * with a solid banner across the bottom holding the name and date
 * in fixed styling — the same layout as a printed ID-photo name/date label.
 */
async function renderLabeledPhoto(
  dataUrl,
  { name, date, bannerColor, nameStyle = NAME_STYLE, dateStyle = DATE_STYLE, maxWidth = 1000 }
) {
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, w, h);

  const hasName = name && name.trim();
  const hasDate = date && date.trim();

  if (hasName || hasDate) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (hasName && hasDate) {
      const nameSize = Math.round(w * 0.052 * (nameStyle?.sizeScale ?? 1));
      const dateSize = Math.round(w * 0.032 * (dateStyle?.sizeScale ?? 1));
      const vPad = Math.round(nameSize * 0.45);
      const lineGap = Math.round(nameSize * 0.22);
      const bannerH = vPad * 2 + nameSize + lineGap + dateSize;
      const bannerY = h - bannerH;

      ctx.fillStyle = bannerColor;
      ctx.fillRect(0, bannerY, w, bannerH);

      const nameY = bannerY + vPad + nameSize / 2;
      const dateY = nameY + nameSize / 2 + lineGap + dateSize / 2;

      ctx.fillStyle = nameStyle?.color || '#ffffff';
      ctx.font = `${nameStyle?.bold ? 700 : 400} ${nameSize}px ${nameStyle?.font || 'Arial, sans-serif'}`;
      ctx.fillText(name.trim().toUpperCase(), w / 2, nameY, w * 0.94);

      ctx.fillStyle = dateStyle?.color || '#ffffff';
      ctx.font = `${dateStyle?.bold ? 700 : 400} ${dateSize}px ${dateStyle?.font || 'Arial, sans-serif'}`;
      ctx.fillText(formatLabelDate(date), w / 2, dateY, w * 0.94);
    } else {
      const style = hasName ? nameStyle : dateStyle;
      const size = Math.round(w * 0.045 * (style?.sizeScale ?? 1));
      const vPad = Math.round(size * 0.5);
      const bannerH = size + vPad * 2;
      const bannerY = h - bannerH;
      const text = hasName ? name.trim().toUpperCase() : formatLabelDate(date);

      ctx.fillStyle = bannerColor;
      ctx.fillRect(0, bannerY, w, bannerH);

      ctx.fillStyle = style?.color || '#ffffff';
      ctx.font = `${style?.bold ? 700 : 400} ${size}px ${style?.font || 'Arial, sans-serif'}`;
      ctx.fillText(text, w / 2, bannerY + bannerH / 2, w * 0.94);
    }
  }

  const dataUrlOut = canvas.toDataURL('image/jpeg', 0.92);
  const byteLength = Math.round((dataUrlOut.length - 'data:image/jpeg;base64,'.length) * 0.75);
  return { dataUrl: dataUrlOut, width: w, height: h, size: byteLength };
}

function PhotoNameDateWorking({ file, api }) {
  const [sourceUrl, setSourceUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [bannerColor, setBannerColor] = useState('#ffffff');
  const [busy, setBusy] = useState(false);
  const drawTimer = useRef(null);

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(setSourceUrl);
  }, [file]);

  // Live preview — redraw shortly after any input changes, debounced so
  // fast typing doesn't re-render the canvas on every keystroke.
  useEffect(() => {
    if (!sourceUrl) return;
    clearTimeout(drawTimer.current);
    drawTimer.current = setTimeout(async () => {
      const result = await renderLabeledPhoto(sourceUrl, { name, date, bannerColor, nameStyle: NAME_STYLE, dateStyle: DATE_STYLE });
      setPreviewUrl(result.dataUrl);
    }, 150);
    return () => clearTimeout(drawTimer.current);
  }, [sourceUrl, name, date, bannerColor]);

  async function handleDownload() {
    if (!sourceUrl) return;
    setBusy(true);
    const result = await renderLabeledPhoto(sourceUrl, {
      name,
      date,
      bannerColor,
      nameStyle: NAME_STYLE,
      dateStyle: DATE_STYLE,
      maxWidth: 1600,
    });
    setBusy(false);
    api.goToResult([{
      name: (file.name.replace(/\.\w+$/, '') || 'photo') + '-labeled.jpg',
      thumb: result.dataUrl,
      originalSize: file.size,
      newSize: result.size,
      downloadUrl: result.dataUrl,
      dims: `${result.width} × ${result.height} px`,
    }]);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
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
        {(previewUrl || sourceUrl) && (
          <div className="flex justify-center rounded-xl border border-neutral-200 bg-neutral-100 p-3">
            <img
              src={previewUrl || sourceUrl}
              alt="preview"
              className="block max-h-[360px] w-auto max-w-[320px] rounded-lg object-contain"
            />
          </div>
        )}
        {file && (
          <div className="mt-3 text-center text-xs text-neutral-500">{formatBytes(file.size)}</div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" /> Name &amp; Date
          </div>

          <label className="mb-1 block text-xs font-medium text-neutral-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tony Stark"
            className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-violet-400"
          />

          <label className="mb-1 block text-xs font-medium text-neutral-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-violet-400"
          />

          <label className="mb-2 block text-xs font-medium text-neutral-600">Banner colour</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {BANNER_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setBannerColor(p.value)}
                title={p.label}
                className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${bannerColor === p.value ? 'ring-violet-500' : 'ring-transparent'}`}
                style={{ background: p.value }}
              />
            ))}
            <input
              type="color"
              value={bannerColor}
              onChange={(e) => setBannerColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-full border border-neutral-200 p-0"
              title="Custom colour"
            />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={busy || !name.trim()}
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Preparing…' : 'Download Photo'}
          </button>
          {!name.trim() && (
            <p className="mt-2 text-center text-[11px] text-neutral-400">Enter a name to enable download.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PhotoNameDatePage() {
  return (
    <>
      <Head>
        <title>Add Name &amp; Date to Photo — ImageYantra</title>
        <meta
          name="description"
          content="Upload a photo, enter a name and date, and instantly add a printed-style name/date banner to your photo — free, right in your browser."
        />
      </Head>

      <PageShell>
        <ToolShell
          title="Add Name &"
          titleAccent="Date to Photo"
          description="Upload a photo, enter a name and date, and get a labeled photo instantly — nothing leaves your device."
          accept="image/*"
          multiple={false}
          fileNoun="PHOTO"
          renderResult={(results, api) => (
            <ToolResult
              items={results}
              onReset={api.reset}
              showDownloadAll={false}
              onDownloadAll={() => {}}
            />
          )}
        >
          {(files, api) => <PhotoNameDateWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}
