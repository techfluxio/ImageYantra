import { useEffect, useState } from 'react';
import { RotateCcw, Ruler, HardDrive, Eye } from 'lucide-react';
import { readFileAsDataURL, loadImage, formatBytes, fileFormatLabel } from '../../utils/imageProcessing.js';

const DPI = 300;

export default function ExamUtilityWorking({ tool, file, api }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!file) return;
    readFileAsDataURL(file).then(async (url) => {
      setDataUrl(url);
      try {
        const img = await loadImage(url);
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      } catch {
        setNatural({ w: 0, h: 0 });
      }
    });
  }, [file]);

  const cm = natural.w ? { w: (natural.w / DPI) * 2.54, h: (natural.h / DPI) * 2.54 } : null;
  const inches = natural.w ? { w: natural.w / DPI, h: natural.h / DPI } : null;

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
            <RotateCcw className="h-3.5 w-3.5" /> Start Again
          </button>
        </div>
        {dataUrl && (
          <div className="mx-auto flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
            <img src={dataUrl} alt="preview" className="max-h-[520px] w-auto max-w-full object-contain" />
          </div>
        )}
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <UtilityIcon slug={tool.slug} /> {tool.name}
          </div>

          <dl className="space-y-2 text-xs">
            <Row label="File size" value={formatBytes(file?.size)} />
            <Row label="Format" value={fileFormatLabel(file)} />
            {natural.w > 0 && <Row label="Pixel dimensions" value={`${natural.w} × ${natural.h} px`} />}
            {cm && <Row label="Physical size (at 300 DPI)" value={`${cm.w.toFixed(2)} × ${cm.h.toFixed(2)} cm`} />}
            {inches && <Row label="Physical size (in)" value={`${inches.w.toFixed(2)} × ${inches.h.toFixed(2)} in`} />}
          </dl>

          <div className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Most exam portals expect a passport-style photo around 3.5 × 4.5 cm and file sizes in the 10 – 200 KB range —
            use the Exam Photo Resizer if this file doesn't match yet.
          </div>
        </div>
      </div>
    </div>
  );
}

function UtilityIcon({ slug }) {
  if (slug === 'check-photo-dimensions') return <Ruler className="h-4 w-4 text-violet-600" />;
  if (slug === 'check-file-size') return <HardDrive className="h-4 w-4 text-violet-600" />;
  return <Eye className="h-4 w-4 text-violet-600" />;
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
