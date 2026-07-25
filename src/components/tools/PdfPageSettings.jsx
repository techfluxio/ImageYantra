import { RectangleVertical, RectangleHorizontal, ImageOff, Image as ImageIcon } from 'lucide-react';
import { PDF_PAGE_SIZES } from '../../utils/pdfProcessing.js';

const MARGIN_OPTIONS = [
  { value: 'none',  label: 'No margin' },
  { value: 'small', label: 'Small' },
  { value: 'big',   label: 'Big' },
];

/**
 * Page orientation / page size / margin controls for image → PDF tools,
 * matching the layout used across the site's other PDF creation options.
 *
 * @param {{pageSize:string, orientation:string, margin:string}} value
 * @param {(next:{pageSize?:string, orientation?:string, margin?:string})=>void} onChange
 */
export default function PdfPageSettings({ value, onChange }) {
  const { pageSize, orientation, margin } = value;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-sm font-bold text-neutral-900">Page orientation</div>
        <div className="grid grid-cols-2 gap-3">
          <OrientationCard
            active={orientation === 'portrait'}
            label="Portrait"
            Icon={RectangleVertical}
            onClick={() => onChange({ orientation: 'portrait' })}
          />
          <OrientationCard
            active={orientation === 'landscape'}
            label="Landscape"
            Icon={RectangleHorizontal}
            onClick={() => onChange({ orientation: 'landscape' })}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-bold text-neutral-900">Page size</div>
        <select
          value={pageSize}
          onChange={(e) => onChange({ pageSize: e.target.value })}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 focus:border-violet-500 focus:outline-none"
        >
          <option value="fit">Fit to image (original size)</option>
          {Object.entries(PDF_PAGE_SIZES).map(([key, preset]) => (
            <option key={key} value={key}>{preset.label}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 text-sm font-bold text-neutral-900">Margin</div>
        <div className="grid grid-cols-3 gap-3">
          {MARGIN_OPTIONS.map((m) => (
            <MarginCard
              key={m.value}
              active={margin === m.value}
              label={m.label}
              variant={m.value}
              onClick={() => onChange({ margin: m.value })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrientationCard({ active, label, Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 transition ${
        active ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
      }`}
    >
      <Icon className={`h-7 w-7 ${active ? 'text-violet-600' : 'text-neutral-400'}`} strokeWidth={1.75} />
      <span className={`text-sm font-medium ${active ? 'text-violet-700' : 'text-neutral-500'}`}>{label}</span>
    </button>
  );
}

function MarginCard({ active, label, variant, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-4 transition ${
        active ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
      }`}
    >
      <span className={`grid h-7 w-7 place-items-center rounded ${active ? 'text-violet-600' : 'text-neutral-400'}`}>
        {variant === 'none' ? (
          <ImageIcon className="h-6 w-6" strokeWidth={1.75} />
        ) : (
          <span
            className={`grid place-items-center rounded border-2 border-dashed ${active ? 'border-violet-300' : 'border-neutral-300'}`}
            style={{ width: variant === 'big' ? 28 : 24, height: variant === 'big' ? 28 : 24, padding: variant === 'big' ? 5 : 3 }}
          >
            <ImageOff className="h-3 w-3" strokeWidth={1.75} />
          </span>
        )}
      </span>
      <span className={`text-sm font-medium ${active ? 'text-violet-700' : 'text-neutral-500'}`}>{label}</span>
    </button>
  );
}
