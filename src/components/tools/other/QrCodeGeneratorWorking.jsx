import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode as QrIcon } from 'lucide-react';
import { ToolCard } from './OtherToolLayout.jsx';

export default function QrCodeGeneratorWorking() {
  const [text, setText] = useState('https://imageyantra.in');
  const [size, setSize] = useState(300);
  const [fg, setFg] = useState('#111111');
  const [bg, setBg] = useState('#ffffff');
  const [level, setLevel] = useState('M');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!text) { setError(''); const ctx = canvasRef.current.getContext('2d'); ctx?.clearRect(0, 0, size, size); return; }
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: fg, light: bg },
    }, (err) => setError(err ? 'Text is too long for this error-correction level.' : ''));
  }, [text, size, fg, bg, level]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Content" icon={QrIcon} className="flex-1">
        <label className="text-xs font-medium text-neutral-600">Text or URL</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Enter a URL, text, phone number, Wi-Fi details…"
          className="mt-1.5 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-600">Size (px)</label>
            <input
              type="number" min="100" max="1000" step="10" value={size}
              onChange={(e) => setSize(Number(e.target.value) || 300)}
              className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">Error correction</label>
            <select
              value={level} onChange={(e) => setLevel(e.target.value)}
              className="mt-1.5 w-full appearance-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">Foreground</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5">
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-7 w-9 cursor-pointer" />
              <span className="text-xs text-neutral-500">{fg}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">Background</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-7 w-9 cursor-pointer" />
              <span className="text-xs text-neutral-500">{bg}</span>
            </div>
          </div>
        </div>
        {error && <div className="mt-3 text-xs font-medium text-rose-600">{error}</div>}
      </ToolCard>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <ToolCard title="Preview">
          <div className="grid place-items-center rounded-xl bg-neutral-50 p-4">
            <canvas ref={canvasRef} width={size} height={size} style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          <button
            type="button"
            onClick={download}
            disabled={!text}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </ToolCard>
      </div>
    </div>
  );
}
