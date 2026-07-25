export function Card({ title, action, children, style }) {
  return (
    <div style={{
      background: 'var(--col-white)', border: '1px solid var(--col-border)', borderRadius: 'var(--r-lg)',
      padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)', ...style,
    }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
          {title && <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 17, fontWeight: 700, color: 'var(--col-text)' }}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'var(--col-white)', border: '1px solid var(--col-border)', borderRadius: 'var(--r-lg)',
      padding: 'var(--sp-5)', flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 12, color: 'var(--col-text3)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--ff-head)', fontSize: 26, fontWeight: 800, color: 'var(--col-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--col-text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function AdminButton({ variant = 'primary', children, ...props }) {
  const styles = {
    primary: { background: 'var(--col-accent)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--col-white)', color: 'var(--col-text)', border: '1.5px solid var(--col-border2)' },
    danger: { background: 'var(--col-red-bg)', color: 'var(--col-red)', border: 'none' },
  };
  return (
    <button
      {...props}
      style={{
        padding: '8px 14px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6, ...styles[variant], ...(props.style || {}),
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 'var(--sp-4)' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--col-text2)' }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 'var(--r-sm)',
  border: '1.5px solid var(--col-border2)',
  fontSize: 14,
  fontFamily: 'var(--ff-body)',
};

export function Table({ columns, rows, renderRow }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--col-border)' }}>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--col-text3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} style={{ borderBottom: '1px solid var(--col-border)' }}>
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--col-text3)', fontSize: 14 }}>Nothing here yet.</div>
      )}
    </div>
  );
}
