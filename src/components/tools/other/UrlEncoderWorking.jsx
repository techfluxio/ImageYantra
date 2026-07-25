import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

export default function UrlEncoderWorking() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('https://example.com/search?q=hello world&lang=en');

  let output = '';
  let error = '';
  try {
    output = mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
  } catch {
    error = 'That doesn\u2019t look like valid encoded text.';
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Input" icon={Link2} className="flex-1">
        <div className="mb-3 inline-flex rounded-lg border border-neutral-200 p-1">
          {['encode', 'decode'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${mode === m ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={mode === 'encode' ? 'Paste a URL or query string…' : 'Paste an encoded URL…'}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400"
        />
      </ToolCard>

      <div className="w-full space-y-4 lg:w-96 lg:shrink-0">
        <ToolCard title="Output">
          <textarea
            readOnly
            value={error || output}
            rows={8}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-sm outline-none"
          />
          <CopyButton getText={() => output} className="mt-3 w-full justify-center" />
        </ToolCard>
      </div>
    </div>
  );
}
