import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminApi } from './adminApi.js';
import { Card, StatCard, AdminButton } from './AdminUI.jsx';

const RANGE_OPTIONS = [7, 30, 90];

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState('day'); // 'day' | 'month'
  const [glitchCount, setGlitchCount] = useState(null);
  const [topGlitchTool, setTopGlitchTool] = useState(null);
  const [toolStats, setToolStats] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    adminApi.analyticsSummary(days)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    adminApi.toolStats(days).then(setToolStats).catch(() => {});
  }, [days]);

  useEffect(() => {
    adminApi.listErrorReports(14).then((reports) => {
      setGlitchCount(reports.length);
      const counts = {};
      for (const r of reports) counts[r.tool_slug] = (counts[r.tool_slug] || 0) + 1;
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      setTopGlitchTool(top ? { tool: top[0], count: top[1] } : null);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 800, color: 'var(--col-text)' }}>Visitor insights</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {RANGE_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid var(--col-border2)',
                background: days === d ? 'var(--col-accent)' : 'var(--col-white)',
                color: days === d ? '#fff' : 'var(--col-text2)',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && <Card><p style={{ color: 'var(--col-red)' }}>{error}</p></Card>}
      {loading && <Card><p style={{ color: 'var(--col-text2)' }}>Loading…</p></Card>}

      {data && !loading && (
        <>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', marginBottom: 'var(--sp-5)' }}>
            <StatCard label="Total page views" value={data.totalViews.toLocaleString()} sub={`Last ${data.rangeDays} days`} />
            <StatCard label="Unique visitors" value={data.uniqueSessions.toLocaleString()} sub="Approx., by session" />
            {toolStats && (
              <>
                <StatCard label="Files processed" value={toolStats.filesProcessed.toLocaleString()} sub={`Last ${days} days`} />
                <StatCard
                  label="Success rate"
                  value={toolStats.successRate !== null ? `${toolStats.successRate}%` : '—'}
                  sub="Completions vs. glitches"
                />
                <StatCard
                  label="Avg. time to result"
                  value={toolStats.avgDurationMs !== null ? `${(toolStats.avgDurationMs / 1000).toFixed(1)}s` : '—'}
                  sub="From file select to done"
                />
              </>
            )}
            <StatCard label="Desktop" value={data.deviceBreakdown.desktop} />
            <StatCard label="Mobile" value={data.deviceBreakdown.mobile} />
            <StatCard label="Tablet" value={data.deviceBreakdown.tablet} />
            {glitchCount !== null && (
              <Link to="/admin/glitches" style={{ textDecoration: 'none' }}>
                <StatCard
                  label="Glitches (14d)"
                  value={glitchCount}
                  sub={topGlitchTool ? `Most: ${topGlitchTool.tool} (${topGlitchTool.count})` : 'No glitches reported'}
                />
              </Link>
            )}
          </div>

          <Card
            title="Page views over time"
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                <AdminButton variant={granularity === 'day' ? 'primary' : 'secondary'} onClick={() => setGranularity('day')}>Daily</AdminButton>
                <AdminButton variant={granularity === 'month' ? 'primary' : 'secondary'} onClick={() => setGranularity('month')}>Monthly</AdminButton>
              </div>
            }
          >
            {(granularity === 'day' ? data.viewsByDay : data.viewsByMonth).length ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={granularity === 'day' ? data.viewsByDay : data.viewsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--col-border)" />
                  <XAxis dataKey={granularity === 'day' ? 'date' : 'month'} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8133e0" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No page views recorded yet for this range.</p>
            )}
          </Card>

          <Card title="Most-visited tools">
            {data.topTools.length ? (
              <>
                <ResponsiveContainer width="100%" height={Math.min(360, 32 * Math.min(data.topTools.length, 10))}>
                  <BarChart data={data.topTools.slice(0, 10)} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="tool" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8133e0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <table style={{ width: '100%', marginTop: 'var(--sp-4)', fontSize: 13.5, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--col-border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--col-text3)' }}>Tool</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--col-text3)' }}>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topTools.map((t) => (
                      <tr key={t.tool} style={{ borderBottom: '1px solid var(--col-border)' }}>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{t.tool}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{t.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No tool-page views recorded yet for this range.</p>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)' }}>
            <Card title="Top pages">
              {data.topPages.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.topPages} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="path" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8133e0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No data yet.</p>
              )}
            </Card>

            <Card title="Top referrers">
              {data.topReferrers.length ? (
                <ul style={{ fontSize: 14 }}>
                  {data.topReferrers.map((r) => (
                    <li key={r.host} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--col-border)' }}>
                      <span style={{ color: 'var(--col-text)' }}>{r.host}</span>
                      <span style={{ color: 'var(--col-text3)', fontWeight: 600 }}>{r.views}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No referrer traffic recorded yet — most visits are direct or from search.</p>
              )}
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)' }}>
            <Card title="Traffic sources">
              {data.trafficSources.length ? (
                <BreakdownList items={data.trafficSources.map((s) => ({ label: s.source, value: s.views }))} />
              ) : (
                <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No data yet.</p>
              )}
            </Card>
            <Card title="Browsers">
              {data.browserBreakdown.length ? (
                <BreakdownList items={data.browserBreakdown.map((b) => ({ label: b.browser, value: b.views }))} />
              ) : (
                <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No data yet.</p>
              )}
            </Card>
          </div>

          {toolStats && (
            <Card title="Tool health">
              {toolStats.perTool.length ? (
                <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--col-border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--col-text3)' }}>Tool</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--col-text3)' }}>Completions</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--col-text3)' }}>Glitches</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--col-text3)' }}>Success</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--col-text3)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toolStats.perTool.map((t) => (
                      <tr key={t.tool} style={{ borderBottom: '1px solid var(--col-border)' }}>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{t.tool}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{t.completions}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{t.errors}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{t.successRate !== null ? `${t.successRate}%` : '—'}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--r-full)',
                            background: t.status === 'Healthy' ? 'var(--col-green-bg)' : t.status === 'Degraded' ? '#fff4e0' : 'var(--col-red-bg)',
                            color: t.status === 'Healthy' ? 'var(--col-green)' : t.status === 'Degraded' ? '#b26a00' : 'var(--col-red)',
                          }}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: 'var(--col-text3)', fontSize: 14 }}>No tool activity recorded yet for this range.</p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function BreakdownList({ items }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <ul>
      {items.map((item) => (
        <li key={item.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
            <span style={{ color: 'var(--col-text)' }}>{item.label}</span>
            <span style={{ color: 'var(--col-text3)', fontWeight: 600 }}>{Math.round((item.value / total) * 100)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 'var(--r-full)', background: 'var(--col-accent-xxl)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(item.value / total) * 100}%`, background: 'var(--col-accent)', borderRadius: 'var(--r-full)' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}