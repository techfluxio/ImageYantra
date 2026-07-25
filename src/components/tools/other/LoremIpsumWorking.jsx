import { useMemo, useState } from 'react';
import { Type } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor '
  + 'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation '
  + 'ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate '
  + 'velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt '
  + 'culpa qui officia deserunt mollit anim id est laborum').split(' ');

function randWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
function sentence(len) {
  const words = Array.from({ length: len }, randWord);
  const s = words.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
function paragraph(sentences) {
  return Array.from({ length: sentences }, () => sentence(6 + Math.floor(Math.random() * 10))).join(' ');
}

export default function LoremIpsumWorking() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPer, setSentencesPer] = useState(5);
  const [startClassic, setStartClassic] = useState(true);
  const [seed, setSeed] = useState(0);

  const output = useMemo(() => {
    const paras = Array.from({ length: paragraphs }, () => paragraph(sentencesPer));
    if (startClassic && paras.length) {
      paras[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paras[0].split('. ').slice(1).join('. ');
    }
    return paras;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphs, sentencesPer, startClassic, seed]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Settings" icon={Type} className="w-full lg:w-72 lg:shrink-0">
        <label className="text-xs font-medium text-neutral-600">Paragraphs</label>
        <input
          type="number" min="1" max="20" value={paragraphs}
          onChange={(e) => setParagraphs(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
        <label className="mt-4 block text-xs font-medium text-neutral-600">Sentences per paragraph</label>
        <input
          type="number" min="1" max="15" value={sentencesPer}
          onChange={(e) => setSentencesPer(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
        <label className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-600">
          <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} />
          Start with "Lorem ipsum dolor sit amet…"
        </label>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Regenerate
        </button>
      </ToolCard>

      <ToolCard title="Output" className="flex-1">
        <div className="max-h-[26rem] space-y-3 overflow-y-auto text-sm leading-relaxed text-neutral-700">
          {output.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <CopyButton getText={() => output.join('\n\n')} className="mt-4 w-full justify-center" />
      </ToolCard>
    </div>
  );
}
