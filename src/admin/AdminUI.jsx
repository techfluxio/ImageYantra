export function PageHeader({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 'var(--sp-7)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {Icon && (
          <div style={{
            width: 46, height: 46, borderRadius: 'var(--r-md)', background: 'var(--col-accent-xxl)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon size={22} color="var(--col-accent)" strokeWidth={2.25} />
          </div>
        )}
        <div>
          <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 26, fontWeight: 800, color: 'var(--col-text)', lineHeight: 1.15 }}>{title}</h1>
          {description && <p style={{ fontSize: 13.5, color: 'var(--col-text2)', marginTop: 4, maxWidth: 560 }}>{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Card({ title, action, children, style }) {
  return (
    <div style={{
      background: 'var(--col-white)', border: '1px solid var(--col-border)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--sh-sm)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)', ...style,
    }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
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
      boxShadow: 'var(--sh-sm)', padding: 'var(--sp-5)', flex: 1, minWidth: 160,
      borderTop: '3px solid var(--col-accent)',
    }}>
      <div style={{ fontSize: 12, color: 'var(--col-text3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--ff-head)', fontSize: 28, fontWeight: 800, color: 'var(--col-text)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--col-text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/**
 * Thin wrapper around the site's real `.btn` classes (see
 * styles/components.css) — this is what makes admin buttons look and
 * behave (hover lift, shadow, pill shape) exactly like the rest of the
 * site, instead of a separately-invented button style.
 */
export function AdminButton({ variant = 'primary', size = 'sm', children, className = '', style, ...props }) {
  return (
    <button
      {...props}
      className={`btn btn--${size} btn--${variant} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 'var(--sp-4)' }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--col-text2)' }}>{label}</label>}
      {children}
    </div>
  );
}

export const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--r-sm)',
  border: '1.5px solid var(--col-border2)',
  fontSize: 14,
  fontFamily: 'var(--ff-body)',
  color: 'var(--col-text)',
  background: 'var(--col-white)',
  transition: 'border-color var(--t-fast)',
  outline: 'none',
};

export function Table({ columns, rows, renderRow }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--col-border)' }}>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--col-text3)', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              style={{ borderBottom: '1px solid var(--col-border)', transition: 'background var(--t-fast)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--col-accent-xxl)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
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