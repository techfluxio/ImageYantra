import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle } from './AdminUI.jsx';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings()
      .then((s) => { setSettings(s); setForm(s); })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await adminApi.updateSettings(settings.id, form);
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 800, color: 'var(--col-text)', marginBottom: 'var(--sp-6)' }}>
        Website Settings
      </h1>

      {!form ? (
        <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
      ) : (
        <Card title="General">
          <form onSubmit={handleSubmit}>
            <Field label="Site title">
              <input style={inputStyle} value={form.site_title || ''} onChange={(e) => setForm({ ...form, site_title: e.target.value })} />
            </Field>
            <Field label="Meta description (used for SEO / social previews)">
              <textarea style={{ ...inputStyle, minHeight: 70 }} value={form.meta_description || ''} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              <Field label="Contact email">
                <input style={inputStyle} value={form.contact_email || ''} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              </Field>
              <Field label="Support email">
                <input style={inputStyle} value={form.support_email || ''} onChange={(e) => setForm({ ...form, support_email: e.target.value })} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-4)' }}>
              <Field label="Twitter / X URL">
                <input style={inputStyle} value={form.twitter_url || ''} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} />
              </Field>
              <Field label="Instagram URL">
                <input style={inputStyle} value={form.instagram_url || ''} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
              </Field>
              <Field label="LinkedIn URL">
                <input style={inputStyle} value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
              </Field>
            </div>

            {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}
            {saved && <p style={{ color: 'var(--col-green)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>Saved.</p>}

            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</AdminButton>
          </form>
        </Card>
      )}
    </div>
  );
}