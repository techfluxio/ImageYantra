import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { ToolCard, CopyButton } from './OtherToolLayout.jsx';

export default function TimestampConverterWorking() {
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [human, setHuman] = useState(() => new Date().toISOString().slice(0, 19));

  const fromTs = useMemo(() => {
    const n = Number(ts);
    if (!ts || Number.isNaN(n)) return null;
    const ms = ts.length > 10 ? n : n * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [ts]);

  function setNow() {
    const now = Date.now();
    setTs(String(Math.floor(now / 1000)));
    setHuman(new Date(now).toISOString().slice(0, 19));
  }

  function fromHumanToTs() {
    const d = new Date(human);
    if (!Number.isNaN(d.getTime())) setTs(String(Math.floor(d.getTime() / 1000)));
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <ToolCard title="Unix Timestamp → Date" icon={Clock} className="flex-1">
        <label className="text-xs font-medium text-neutral-600">Timestamp (seconds or ms)</label>
        <input
          value={ts}
          onChange={(e) => setTs(e.target.value.replace(/[^0-9]/g, ''))}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-neutral-400"
        />
        <button type="button" onClick={setNow} className="mt-3 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Use current time
        </button>

        {fromTs ? (
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ['ISO 8601', fromTs.toISOString()],
              ['UTC', fromTs.toUTCString()],
              ['Local', fromTs.toString()],
              ['Relative', relativeTime(fromTs)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{label}</dt>
                  <dd className="font-mono text-xs text-neutral-800">{value}</dd>
                </div>
                <CopyButton getText={() => value} />
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-4 text-xs text-rose-600">Enter a valid Unix timestamp.</div>
        )}
      </ToolCard>

      <ToolCard title="Date → Unix Timestamp" className="w-full lg:w-80 lg:shrink-0">
        <label className="text-xs font-medium text-neutral-600">Date &amp; time</label>
        <input
          type="datetime-local"
          value={human}
          onChange={(e) => setHuman(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
        <button
          type="button"
          onClick={fromHumanToTs}
          className="mt-3 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Convert to timestamp
        </button>
      </ToolCard>
    </div>
  );
}

function relativeTime(date) {
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === 'second') {
      const val = Math.round(diffSec / secs);
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(val, unit);
    }
  }
  return '';
}
