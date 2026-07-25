import { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';
import { uuidV4 } from '../../../utils/otherToolsUtils.js';

export default function UuidGeneratorWorking() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [list, setList] = useState(() => Array.from({ length: 5 }, uuidV4));

  function format(id) {
    let v = hyphens ? id : id.replace(/-/g, '');
    return uppercase ? v.toUpperCase() : v;
  }

  function regenerate() {
    setList(Array.from({ length: count }, uuidV4));
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Settings" icon={Fingerprint} className="w-full lg:w-72 lg:shrink-0">
        <label className="text-xs font-medium text-neutral-600">How many?</label>
        <input
          type="number" min="1" max="100" value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
        <label className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-600">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} /> Uppercase
        </label>
        <label className="mt-2 flex items-center gap-2 text-xs font-medium text-neutral-600">
          <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} /> Keep hyphens
        </label>
        <button
          type="button"
          onClick={regenerate}
          className="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Generate
        </button>
      </ToolCard>

      <ToolCard title={`UUID v4 × ${list.length}`} className="flex-1">
        <ul className="max-h-96 space-y-2 overflow-y-auto">
          {list.map((id, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
              <span className="font-mono text-sm text-neutral-800">{format(id)}</span>
              <CopyButton getText={() => format(id)} />
            </li>
          ))}
        </ul>
        <CopyButton getText={() => list.map(format).join('\n')} className="mt-3 w-full justify-center" />
      </ToolCard>
    </div>
  );
}
