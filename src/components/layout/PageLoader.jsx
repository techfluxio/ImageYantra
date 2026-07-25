/* ── Loading fallback (shown while a lazy-loaded route chunk downloads) ── */
export default function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--col-bg)',
        paddingTop: 'var(--nav-h)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--col-accent)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.85s linear infinite',
          }}
        />
        <span style={{ fontSize: 14, color: 'var(--col-text3)' }}>Loading…</span>
      </div>
    </div>
  );
}
