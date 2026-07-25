import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle, Table } from './AdminUI.jsx';

const EMPTY_FORM = { group_name: '', group_sort: 0, label: '', url: '', external: false, sort_order: 0 };

export default function AdminFooter() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi.listFooterLinks()
      .then(setLinks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(link) {
    setEditingId(link.id);
    setForm({ group_name: link.group_name, group_sort: link.group_sort, label: link.label, url: link.url, external: link.external, sort_order: link.sort_order });
  }
  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await adminApi.updateFooterLink(editingId, form);
      } else {
        await adminApi.createFooterLink(form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(link) {
    if (!window.confirm(`Delete "${link.label}"?`)) return;
    await adminApi.deleteFooterLink(link.id);
    load();
  }

  const groups = Array.from(new Set(links.map((l) => l.group_name)));

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 800, color: 'var(--col-text)', marginBottom: 'var(--sp-6)' }}>
        Footer
      </h1>
      <p style={{ fontSize: 13, color: 'var(--col-text2)', marginBottom: 'var(--sp-5)' }}>
        These become the footer's link columns, grouped by "Group name" (e.g. "Categories",
        "Popular Tools", "Company"). If no footer links have been added here yet, the site
        falls back to its original built-in footer — you won't lose anything by leaving this empty.
      </p>

      <Card title={editingId ? 'Edit link' : 'Add a footer link'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Group name (column title)">
              <input style={inputStyle} required list="group-names" value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })} />
              <datalist id="group-names">
                {groups.map((g) => <option key={g} value={g} />)}
              </datalist>
            </Field>
            <Field label="Group order (lower = further left)">
              <input style={inputStyle} type="number" value={form.group_sort} onChange={(e) => setForm({ ...form, group_sort: Number(e.target.value) })} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Link label">
              <input style={inputStyle} required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </Field>
            <Field label="URL or path (e.g. /pdf-tools or https://...)">
              <input style={inputStyle} required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </Field>
          </div>
          <Field label="">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={form.external} onChange={(e) => setForm({ ...form, external: e.target.checked })} />
              Opens in a new tab (external link)
            </label>
          </Field>

          {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add link'}</AdminButton>
            {editingId && <AdminButton type="button" variant="secondary" onClick={cancelEdit}>Cancel</AdminButton>}
          </div>
        </form>
      </Card>

      <Card title={`All footer links (${links.length})`}>
        {loading ? (
          <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
        ) : (
          <Table
            columns={['Group', 'Label', 'URL', 'Actions']}
            rows={links}
            renderRow={(l) => (
              <>
                <td style={cellStyle}>{l.group_name}</td>
                <td style={cellStyle}>{l.label}</td>
                <td style={{ ...cellStyle, color: 'var(--col-text3)', fontFamily: 'monospace' }}>{l.url}</td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <AdminButton variant="secondary" onClick={() => startEdit(l)}>Edit</AdminButton>
                    <AdminButton variant="danger" onClick={() => handleDelete(l)}>Delete</AdminButton>
                  </div>
                </td>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}

const cellStyle = { padding: '10px', verticalAlign: 'middle' };
