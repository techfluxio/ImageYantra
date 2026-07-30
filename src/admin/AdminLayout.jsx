import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, LayoutGrid, Newspaper, PanelBottom, Megaphone, Bug, LogOut, ExternalLink,
  FileText, Settings, DatabaseBackup,
} from 'lucide-react';
import { adminApi } from './adminApi.js';
import logoMark from '../assets/images/logo-64.png';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/tools', label: 'Tools', Icon: Wrench },
  { to: '/admin/categories', label: 'Categories', Icon: LayoutGrid },
  { to: '/admin/blog', label: 'Blog', Icon: Newspaper },
  { to: '/admin/pages', label: 'Pages', Icon: FileText },
  { to: '/admin/footer', label: 'Footer', Icon: PanelBottom },
  { to: '/admin/ads', label: 'Ads', Icon: Megaphone },
  { to: '/admin/glitches', label: 'Glitches', Icon: Bug },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
  { to: '/admin/backup', label: 'Backup', Icon: DatabaseBackup },
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
    return (
      <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--col-bg)', color: 'var(--col-text2)', fontFamily: 'var(--ff-body)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--col-bg)', fontFamily: 'var(--ff-body)' }}>
      <aside style={{
        width: 280, flexShrink: 0, background: 'var(--col-white)', borderRight: '1px solid var(--col-border)',
        padding: 'var(--sp-6) var(--sp-4)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{
          marginBottom: 'var(--sp-8)', paddingLeft: 'var(--sp-2)', width: 'fit-content',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src={logoMark} alt="ImageYantra" width={26} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 19, fontWeight: 800, color: 'var(--col-text)' }}>
              Image<span style={{ color: 'var(--col-accent)' }}>Yantra</span>
            </div>
            <span style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 3, marginBottom: 3, whiteSpace: 'nowrap',
              padding: '3px 10px', borderRadius: 'var(--r-full)', background: 'var(--col-accent-xxl, #f3e8ff)', color: 'var(--col-accent)',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
            }}>
              Admin
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: isActive ? 700 : 600,
                color: isActive ? 'var(--col-accent)' : 'var(--col-text2)',
                background: isActive ? 'var(--col-accent-xxl)' : 'transparent',
                textDecoration: 'none',
                transition: 'background var(--t-fast), color var(--t-fast)',
              })}
            >
              <Icon size={17} strokeWidth={2.25} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--r-md)',
              fontSize: 13, fontWeight: 600, color: 'var(--col-text2)', textDecoration: 'none',
            }}
          >
            <ExternalLink size={16} strokeWidth={2.25} />
            View live site
          </a>
          <button
            onClick={handleLogout}
            className="btn btn--sm btn--secondary"
            style={{ justifyContent: 'center', width: '100%' }}
          >
            <LogOut size={16} strokeWidth={2.25} />
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: 'var(--sp-8)', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1600, width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}