import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from './adminApi.js';
import logoMark from '../assets/images/logo-64.png';

function FocusInput({ style, ...props }) {
  return (
    <input
      {...props}
      style={style}
      onFocus={(e) => { e.target.style.borderColor = 'var(--col-accent)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--col-border2)'; }}
    />
  );
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await adminApi.login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--col-bg)',
      padding: 'var(--sp-4)', overflow: 'hidden', fontFamily: 'var(--ff-body)',
    }}>
      {/* Ambient brand glow — same accent color as the rest of the site, kept subtle */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: 640, height: 640, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--col-glow2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--col-glow) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Link
        to="/"
        style={{
          position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: 'var(--col-text2)', textDecoration: 'none',
          marginBottom: 'var(--sp-6)',
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.25} />
        Back to site
      </Link>

      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative', width: '100%', maxWidth: 400, background: 'var(--col-white)',
          borderRadius: 'var(--r-xl)', border: '1px solid var(--col-border)', boxShadow: 'var(--sh-xl)',
          padding: 'var(--sp-9) var(--sp-8)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--sp-7)' }}>
          <img src={logoMark} alt="ImageYantra" width={44} height={44} style={{ objectFit: 'contain', marginBottom: 14 }} />
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 22, fontWeight: 800, color: 'var(--col-text)' }}>
            Image<span style={{ color: 'var(--col-accent)' }}>Yantra</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '3px 10px',
            borderRadius: 'var(--r-full)', background: 'var(--col-accent-xxl)', color: 'var(--col-accent)',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            Admin
          </div>
          <p style={{ fontSize: 14, color: 'var(--col-text2)', marginTop: 14 }}>Sign in to manage your site.</p>
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--col-text2)' }}>Email</label>
        <FocusInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoFocus
          placeholder="you@imageyantra.in"
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '16px 0 6px', color: 'var(--col-text2)' }}>Password</label>
        <FocusInput
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="••••••••"
        />

        {error && (
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--col-red)', background: 'var(--col-red-bg)', padding: '10px 12px', borderRadius: 'var(--r-sm)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn btn--primary btn--lg"
          style={{ width: '100%', marginTop: 'var(--sp-6)', justifyContent: 'center' }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ position: 'relative', fontSize: 12, color: 'var(--col-text3)', marginTop: 'var(--sp-6)' }}>
        ImageYantra Admin · private, not indexed by search engines
      </p>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 'var(--r-sm)',
  border: '1.5px solid var(--col-border2)',
  fontSize: 14,
  fontFamily: 'var(--ff-body)',
  color: 'var(--col-text)',
  background: 'var(--col-white)',
  outline: 'none',
  transition: 'border-color var(--t-fast)',
};