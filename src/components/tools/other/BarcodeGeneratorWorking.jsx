import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Barcode as BarcodeIcon } from 'lucide-react';
import { ToolCard } from './OtherToolLayout.jsx';

const FORMATS = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'ITF14', 'MSI', 'pharmacode'];

export default function BarcodeGeneratorWorking() {
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    try {
      JsBarcode(canvasRef.current, text, {
        format,
        lineColor: '#111111',
        width: 2,
        height: 100,
        displayValue: true,
        margin: 10,
      });
      setError('');
    } catch {
      setError(`"${text}" isn't valid for the ${format} format.`);
    }
  }, [text, format]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'barcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Content" icon={BarcodeIcon} className="flex-1">
        <label className="text-xs font-medium text-neutral-600">Value</label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a number or code"
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />

        <label className="mt-4 block text-xs font-medium text-neutral-600">Format</label>
        <select
          value={format} onChange={(e) => setFormat(e.target.value)}
          className="mt-1.5 w-full appearance-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        >
          {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        {error && <div className="mt-3 text-xs font-medium text-rose-600">{error}</div>}
        <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
          <strong>Tip:</strong> EAN13 needs exactly 12–13 digits, EAN8 needs 7–8 digits, and UPC needs 11–12 digits.
        </div>
      </ToolCard>

      <div className="w-full space-y-4 lg:w-96 lg:shrink-0">
        <ToolCard title="Preview">
          <div className="grid place-items-center overflow-x-auto rounded-xl bg-neutral-50 p-4">
            <canvas ref={canvasRef} />
          </div>
          <button
            type="button"
            onClick={download}
            disabled={!text || !!error}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </ToolCard>
      </div>
    </div>
  );
}
