import { useRef, useState } from 'react';
import { Binary, Upload } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

export default function Base64Working() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  let output = '';
  try {
    output = mode === 'encode'
      ? btoa(unescape(encodeURIComponent(input)))
      : decodeURIComponent(escape(atob(input.trim())));
    if (error) setError('');
  } catch {
    output = '';
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setMode('encode');
      setInput(String(result).split(',')[1] ? atob(String(result).split(',')[1]) : '');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Input" icon={Binary} className="flex-1">
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
          rows={10}
          placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste Base64 to decode…'}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <Upload className="h-3.5 w-3.5" /> Load a file to encode
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
      </ToolCard>

      <div className="w-full space-y-4 lg:w-96 lg:shrink-0">
        <ToolCard title="Output">
          <textarea
            readOnly
            value={output || (input ? `Invalid ${mode === 'decode' ? 'Base64' : 'input'}` : '')}
            rows={10}
            className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-sm outline-none"
          />
          <CopyButton getText={() => output} className="mt-3 w-full justify-center" />
        </ToolCard>
      </div>
    </div>
  );
}
