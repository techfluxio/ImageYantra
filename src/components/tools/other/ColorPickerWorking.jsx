import { useMemo, useState } from 'react';
import { Palette } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{1,2}/g) || [];
  const [r, g, b] = m.map((h) => parseInt(h, 16));
  return { r: r || 0, g: g || 0, b: b || 0 };
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s; const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function shade(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const f = (c) => {
    const v = percent < 0 ? c * (1 + percent / 100) : c + (255 - c) * (percent / 100);
    return Math.max(0, Math.min(255, Math.round(v)));
  };
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export default function ColorPickerWorking() {
  const [color, setColor] = useState('#7C3AED');

  const { r, g, b } = useMemo(() => hexToRgb(color), [color]);
  const { h, s, l } = useMemo(() => rgbToHsl(r, g, b), [r, g, b]);
  const shades = useMemo(() => [-60, -40, -20, 0, 20, 40, 60].map((p) => shade(color, p)), [color]);

  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Pick a color" icon={Palette} className="flex-1">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-16 w-16 cursor-pointer rounded-lg border border-neutral-200"
          />
          <input
            value={color}
            onChange={(e) => /^#?[0-9a-fA-F]{0,6}$/.test(e.target.value) && setColor(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-neutral-400"
          />
        </div>

        <div className="mt-6 h-24 w-full rounded-xl border border-neutral-200" style={{ background: color }} />

        <div className="mt-4 space-y-2">
          {[['HEX', color], ['RGB', rgbStr], ['HSL', hslStr]].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
                <div className="font-mono text-sm text-neutral-900">{value}</div>
              </div>
              <CopyButton getText={() => value} />
            </div>
          ))}
        </div>
      </ToolCard>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <ToolCard title="Shades">
          <div className="grid grid-cols-7 gap-1.5 overflow-hidden rounded-lg">
            {shades.map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setColor(sc)}
                className="aspect-square rounded-md ring-1 ring-inset ring-black/5"
                style={{ background: sc }}
                title={sc}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">Click a shade to use it.</p>
        </ToolCard>
      </div>
    </div>
  );
}
