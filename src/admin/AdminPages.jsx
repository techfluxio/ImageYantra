import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle, Table, PageHeader } from './AdminUI.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import { FileText } from 'lucide-react';

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi.listPages()
      .then(setPages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(page) {
    setEditingId(page.id);
    setForm({ title: page.title, body: page.body || '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.updatePage(editingId, form);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Pages"
        description="About Us, Privacy Policy, Terms of Service, and Disclaimer. Leave a page's content blank to keep showing the site's original built-in version."
      />

      {editingId ? (
        <Card title={`Edit: ${pages.find((p) => p.id === editingId)?.title}`}>
          <form onSubmit={handleSubmit}>
            <Field label="Title">
              <input style={inputStyle} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Content">
              <RichTextEditor value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} minHeight={340} />
            </Field>
            {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</AdminButton>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="All pages">
          {loading ? (
            <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
          ) : (
            <Table
              columns={['Page', 'Status', 'Actions']}
              rows={pages}
              renderRow={(p) => (
                <>
                  <td style={cellStyle}>{p.title}</td>
                  <td style={cellStyle}>
                    <span style={{ fontSize: 12, color: p.body ? 'var(--col-accent)' : 'var(--col-text3)', fontWeight: 600 }}>
                      {p.body ? 'Custom content' : 'Using default'}
                    </span>
                  </td>
                  <td style={cellStyle}><AdminButton variant="secondary" onClick={() => startEdit(p)}>Edit</AdminButton></td>
                </>
              )}
            />
          )}
        </Card>
      )}
    </div>
  );
}

const cellStyle = { padding: '10px', verticalAlign: 'middle' };