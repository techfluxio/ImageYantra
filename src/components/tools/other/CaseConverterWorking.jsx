import { useState } from 'react';
import { CaseSensitive } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

function toTitleCase(s) { return s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()); }
function toSentenceCase(s) { const l = s.toLowerCase(); return l.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase()); }
function words(s) { return s.trim().split(/[\s_-]+|(?=[A-Z])/).filter(Boolean).map((w) => w.toLowerCase()); }
function toCamel(s) { const w = words(s); return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join(''); }
function toPascal(s) { return words(s).map((x) => x[0].toUpperCase() + x.slice(1)).join(''); }
function toSnake(s) { return words(s).join('_'); }
function toKebab(s) { return words(s).join('-'); }

const CASES = [
  { key: 'UPPERCASE', fn: (s) => s.toUpperCase() },
  { key: 'lowercase', fn: (s) => s.toLowerCase() },
  { key: 'Title Case', fn: toTitleCase },
  { key: 'Sentence case', fn: toSentenceCase },
  { key: 'camelCase', fn: toCamel },
  { key: 'PascalCase', fn: toPascal },
  { key: 'snake_case', fn: toSnake },
  { key: 'kebab-case', fn: toKebab },
];

export default function CaseConverterWorking() {
  const [text, setText] = useState('The Quick Brown Fox Jumps Over The Lazy Dog');

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Text" icon={CaseSensitive} className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Type or paste text here…"
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </ToolCard>

      <div className="w-full space-y-3 lg:w-[26rem] lg:shrink-0">
        {CASES.map(({ key, fn }) => {
          const value = text ? fn(text) : '';
          return (
            <ToolCard key={key} title={key}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 break-all font-mono text-xs text-neutral-700">{value || '—'}</div>
                <CopyButton getText={() => value} />
              </div>
            </ToolCard>
          );
        })}
      </div>
    </div>
  );
}
