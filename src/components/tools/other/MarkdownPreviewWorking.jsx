import { useMemo, useState } from 'react';
import { FileCode } from 'lucide-react';
import { ToolCard } from './OtherToolLayout.jsx';
import { renderMarkdown } from '../../../utils/otherToolsUtils.js';

const SAMPLE = `# Welcome to ImageYantra

**Bold**, *italic*, and \`inline code\` all work.

- Free browser-based tools
- No signup required
- [Visit ImageYantra](https://imageyantra.in)

> Your files never leave your device.
`;

export default function MarkdownPreviewWorking() {
  const [md, setMd] = useState(SAMPLE);
  const html = useMemo(() => renderMarkdown(md), [md]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Markdown" icon={FileCode} className="flex-1">
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          rows={16}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400"
        />
      </ToolCard>

      <ToolCard title="Preview" className="flex-1">
        <div
          className="markdown-preview max-h-[26rem] overflow-y-auto text-sm leading-relaxed text-neutral-800 [&_a]:text-violet-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-200 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-500 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:font-bold [&_hr]:my-3 [&_hr]:border-neutral-200 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-900 [&_pre]:p-3 [&_pre]:text-neutral-100 [&_ul]:mb-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </ToolCard>
    </div>
  );
}
