import { useEffect, useMemo, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, StatCard, Table, PageHeader } from './AdminUI.jsx';
import { Bug } from 'lucide-react';

function browserFromUA(ua = '') {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Other';
}

export default function AdminGlitches() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(14);

  function load() {
    setLoading(true);
    adminApi.listErrorReports(days)
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [days]);

  const byTool = useMemo(() => {
    const map = new Map();
    for (const r of reports) {
      const key = r.tool_slug;
      if (!map.has(key)) map.set(key, { tool: key, count: 0, browsers: new Set() });
      const entry = map.get(key);
      entry.count += 1;
      entry.browsers.add(browserFromUA(r.user_agent));
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [reports]);

  async function handleDelete(r) {
    await adminApi.deleteErrorReport(r.id);
    load();
  }

  return (
    <div>
      <PageHeader
        icon={Bug}
        title="Glitches"
        description="Lightweight error reports from real visitors — tool, message, browser and device only. No uploaded file content or personal data is ever captured."
      />

      <div style={{ display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)', flexWrap: 'wrap' }}>
        <StatCard label={`Reports (last ${days}d)`} value={reports.length} />
        <StatCard label="Tools affected" value={byTool.length} />
        <StatCard label="Most affected tool" value={byTool[0]?.tool || '—'} sub={byTool[0] ? `${byTool[0].count} reports` : ''} />
      </div>

      <Card
        title="By tool"
        action={
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--col-border2)', fontSize: 13 }}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        }
      >
        {loading ? (
          <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
        ) : (
          <Table
            columns={['Tool', 'Reports', 'Browsers seen']}
            rows={byTool}
            renderRow={(row) => (
              <>
                <td style={cellStyle} className="mono">{row.tool}</td>
                <td style={cellStyle}>{row.count}</td>
                <td style={cellStyle}>{Array.from(row.browsers).join(', ')}</td>
              </>
            )}
          />
        )}
      </Card>

      <Card title={`Recent reports (${reports.length})`}>
        <Table
          columns={['When', 'Tool', 'Message', 'Browser', 'Device', '']}
          rows={reports}
          renderRow={(r) => (
            <>
              <td style={{ ...cellStyle, whiteSpace: 'nowrap', color: 'var(--col-text3)' }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ ...cellStyle, fontFamily: 'monospace' }}>{r.tool_slug}</td>
              <td style={{ ...cellStyle, maxWidth: 320 }}>{r.message}</td>
              <td style={cellStyle}>{browserFromUA(r.user_agent)}</td>
              <td style={cellStyle}>{r.device_type}</td>
              <td style={cellStyle}><AdminButton variant="danger" onClick={() => handleDelete(r)}>✕</AdminButton></td>
            </>
          )}
        />
      </Card>
    </div>
  );
}

const cellStyle = { padding: '10px', verticalAlign: 'middle' };