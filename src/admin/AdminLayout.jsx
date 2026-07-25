import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi.js';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/tools', label: 'Tools' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/footer', label: 'Footer' },
  { to: '/admin/ads', label: 'Ads' },
  { to: '/admin/glitches', label: 'Glitches' },
];

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.me()
      .then(() => setChecking(false))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  async function handleLogout() {
    await adminApi.logout();
    navigate('/admin/login');
  }

  if (checking) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--col-text2)' }}>Loading…</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--col-bg)' }}>
      <aside style={{
        width: 220, flexShrink: 0, background: 'var(--col-text)', color: 'rgba(255,255,255,0.85)',
        padding: 'var(--sp-6) var(--sp-4)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 'var(--sp-8)' }}>
          Image<span style={{ color: 'var(--col-accent-l)' }}>Yantra</span>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Admin panel</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-6)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', fontSize: 14, fontWeight: 600,
              color: 'rgba(255,255,255,0.65)', background: 'none', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: 'var(--sp-8)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
