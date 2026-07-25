import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi.js';

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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--col-surface2)', padding: 'var(--sp-4)',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 380, background: 'var(--col-white)', borderRadius: 'var(--r-xl)',
          border: '1px solid var(--col-border)', boxShadow: 'var(--sh-md)', padding: 'var(--sp-8)',
        }}
      >
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--col-text)' }}>
          Image<span style={{ color: 'var(--col-accent)' }}>Yantra</span> Admin
        </div>
        <p style={{ fontSize: 14, color: 'var(--col-text2)', marginBottom: 'var(--sp-6)' }}>Sign in to manage the site.</p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--col-text2)' }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoFocus
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '14px 0 6px', color: 'var(--col-text2)' }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--col-red)', background: 'var(--col-red-bg)', padding: '8px 12px', borderRadius: 'var(--r-sm)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn btn--primary btn--md"
          style={{ width: '100%', marginTop: 'var(--sp-5)', justifyContent: 'center' }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--r-sm)',
  border: '1.5px solid var(--col-border2)',
  fontSize: 14,
  fontFamily: 'var(--ff-body)',
};
