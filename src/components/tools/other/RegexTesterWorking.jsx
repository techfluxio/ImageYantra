import { useMemo, useState } from 'react';
import { Regex as RegexIcon } from 'lucide-react';
import { ToolCard } from './OtherToolLayout.jsx';

export default function RegexTesterWorking() {
  const [pattern, setPattern] = useState('\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState('Contact us at hello@imageyantra.in or support@imageyantra.in for help.');

  const { error, matches, highlighted } = useMemo(() => {
    if (!pattern) return { error: '', matches: [], highlighted: text };
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const found = [...text.matchAll(re)];
      let html = '';
      let last = 0;
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      for (const m of found) {
        html += esc(text.slice(last, m.index));
        html += `<mark class="rounded bg-amber-200 px-0.5">${esc(m[0])}</mark>`;
        last = m.index + m[0].length;
      }
      html += esc(text.slice(last));
      return { error: '', matches: found, highlighted: html };
    } catch (e) {
      return { error: e.message, matches: [], highlighted: text };
    }
  }, [pattern, flags, text]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Pattern" icon={RegexIcon} className="flex-1">
        <label className="text-xs font-medium text-neutral-600">Regular expression</label>
        <div className="mt-1.5 flex items-center rounded-lg border border-neutral-200 focus-within:border-neutral-400">
          <span className="pl-3 text-neutral-400">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full border-none bg-transparent px-2 py-2.5 font-mono text-sm outline-none"
          />
          <span className="text-neutral-400">/</span>
          <input
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
            className="w-16 border-none bg-transparent py-2.5 pr-3 font-mono text-sm outline-none"
          />
        </div>
        {error && <div className="mt-2 text-xs font-medium text-rose-600">{error}</div>}

        <label className="mt-4 block text-xs font-medium text-neutral-600">Test string</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="mt-1.5 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </ToolCard>

      <div className="w-full space-y-4 lg:w-96 lg:shrink-0">
        <ToolCard title="Highlighted matches">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700" dangerouslySetInnerHTML={{ __html: highlighted || '—' }} />
        </ToolCard>
        <ToolCard title={`Matches (${matches.length})`}>
          {matches.length ? (
            <ul className="max-h-64 space-y-2 overflow-y-auto text-xs">
              {matches.map((m, i) => (
                <li key={i} className="rounded-lg bg-neutral-50 p-2 font-mono">
                  <span className="text-neutral-400">#{i + 1}:</span> {m[0]}
                  {m.length > 1 && <div className="mt-1 text-neutral-500">groups: {m.slice(1).map((g) => g ?? 'undefined').join(', ')}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-neutral-400">No matches yet.</div>
          )}
        </ToolCard>
      </div>
    </div>
  );
}
