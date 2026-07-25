import { useState } from 'react';
import { Braces } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

export default function JsonFormatterWorking() {
  const [input, setInput] = useState('{"name":"ImageYantra","tools":115,"free":true}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function run(action) {
    try {
      const parsed = JSON.parse(input);
      setOutput(action === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Input JSON" icon={Braces} className="flex-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          placeholder="Paste JSON here…"
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400"
        />
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => run('format')} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Format &amp; Validate
          </button>
          <button type="button" onClick={() => run('minify')} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
            Minify
          </button>
        </div>
        {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600">Invalid JSON: {error}</div>}
        {!error && output && <div className="mt-3 text-xs font-medium text-emerald-600">Valid JSON ✓</div>}
      </ToolCard>

      <div className="w-full space-y-4 lg:w-96 lg:shrink-0">
        <ToolCard title="Output">
          <textarea
            readOnly
            value={output}
            rows={14}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs outline-none"
          />
          <CopyButton getText={() => output} className="mt-3 w-full justify-center" />
        </ToolCard>
      </div>
    </div>
  );
}
