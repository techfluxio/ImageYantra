import { useMemo, useRef, useState } from 'react';
import { Table, Upload } from 'lucide-react';
import { ToolCard } from './OtherToolLayout.jsx';
import { parseCsv } from '../../../utils/otherToolsUtils.js';

const SAMPLE = 'name,role,city\nAnita Sharma,Designer,Patna\nRahul Verma,Developer,Bengaluru\nMeera Iyer,PM,Mumbai';

export default function CsvViewerWorking() {
  const [text, setText] = useState(SAMPLE);
  const fileRef = useRef(null);

  const rows = useMemo(() => parseCsv(text), [text]);
  const header = rows[0] || [];
  const body = rows.slice(1);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="CSV Source" icon={Table} className="w-full lg:w-96 lg:shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste CSV text, or load a file…"
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-xs outline-none focus:border-neutral-400"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <Upload className="h-3.5 w-3.5" /> Load a .csv file
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      </ToolCard>

      <ToolCard title={`Table (${body.length} row${body.length === 1 ? '' : 's'})`} className="flex-1 overflow-x-auto">
        {header.length ? (
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th key={i} className="border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left font-semibold text-neutral-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="odd:bg-white even:bg-neutral-50/50">
                  {header.map((_, ci) => (
                    <td key={ci} className="border-b border-neutral-100 px-3 py-2 text-neutral-700">{r[ci] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-sm text-neutral-400">No data yet — paste some CSV on the left.</div>
        )}
      </ToolCard>
    </div>
  );
}
