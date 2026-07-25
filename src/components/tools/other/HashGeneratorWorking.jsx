import { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';
import { md5, subtleHashHex } from '../../../utils/otherToolsUtils.js';

const ALGOS = [
  { key: 'MD5', run: (t) => Promise.resolve(md5(t)) },
  { key: 'SHA-1', run: (t) => subtleHashHex('SHA-1', t) },
  { key: 'SHA-256', run: (t) => subtleHashHex('SHA-256', t) },
  { key: 'SHA-384', run: (t) => subtleHashHex('SHA-384', t) },
  { key: 'SHA-512', run: (t) => subtleHashHex('SHA-512', t) },
];

export default function HashGeneratorWorking() {
  const [input, setInput] = useState('ImageYantra');
  const [hashes, setHashes] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(ALGOS.map(async (a) => [a.key, input ? await a.run(input) : '']));
      if (!cancelled) setHashes(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [input]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Input" icon={Hash} className="flex-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="Type or paste text to hash…"
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </ToolCard>

      <div className="w-full space-y-3 lg:w-[28rem] lg:shrink-0">
        {ALGOS.map((a) => (
          <ToolCard key={a.key} title={a.key}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 break-all font-mono text-xs text-neutral-700">{hashes[a.key] || '—'}</div>
              <CopyButton getText={() => hashes[a.key]} />
            </div>
          </ToolCard>
        ))}
      </div>
    </div>
  );
}
