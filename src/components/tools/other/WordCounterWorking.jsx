import { useMemo, useState } from 'react';
import { ListChecks } from 'lucide-react';
import { ToolCard } from './OtherToolLayout.jsx';

export default function WordCounterWorking() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length || 1 : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const speakingTime = Math.max(1, Math.ceil(words / 130));
    return { words, chars, charsNoSpace, sentences, paragraphs, readingTime, speakingTime };
  }, [text]);

  const rows = [
    ['Words', stats.words],
    ['Characters', stats.chars],
    ['Characters (no spaces)', stats.charsNoSpace],
    ['Sentences', stats.sentences],
    ['Paragraphs', stats.paragraphs],
    ['Reading time', `${stats.readingTime} min`],
    ['Speaking time', `${stats.speakingTime} min`],
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Text" icon={ListChecks} className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Paste or type your text here…"
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </ToolCard>

      <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
        <ToolCard title="Stats">
          <dl className="space-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="font-semibold text-neutral-900">{value}</dd>
              </div>
            ))}
          </dl>
        </ToolCard>
      </div>
    </div>
  );
}
