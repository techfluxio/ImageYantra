import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle, Table } from './AdminUI.jsx';

const COLOR_OPTIONS = ['purple', 'red', 'green', 'blue', 'yellow', 'black'];
const EMPTY_FORM = { slug: '', name: '', description: '', icon: 'sparkles', color: 'purple' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi.listCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({ slug: cat.slug, name: cat.name, description: cat.description || '', icon: cat.icon || 'sparkles', color: cat.color || 'purple' });
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
        await adminApi.updateCategory(editingId, form);
      } else {
        await adminApi.createCategory({ ...form, sort_order: categories.length });
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Delete "${cat.name}"? Tools in this category won't be deleted, but they'll lose their category until reassigned.`)) return;
    await adminApi.deleteCategory(cat.id);
    load();
  }

  async function move(cat, direction) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const i = sorted.findIndex((c) => c.id === cat.id);
    const j = i + direction;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i].sort_order, sorted[j].sort_order] = [sorted[j].sort_order, sorted[i].sort_order];
    await adminApi.reorderCategories([{ id: sorted[i].id, sort_order: sorted[i].sort_order }, { id: sorted[j].id, sort_order: sorted[j].sort_order }]);
    load();
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 800, color: 'var(--col-text)', marginBottom: 'var(--sp-6)' }}>
        Categories
      </h1>
      <p style={{ fontSize: 13, color: 'var(--col-text2)', marginBottom: 'var(--sp-5)' }}>
        A new category gets a real listing page (e.g. <code>/{form.slug || 'your-slug'}</code>) and
        shows up in the site's navigation automatically — no code changes needed. Note: it can take a
        couple of minutes for a brand-new category's own prerendered page to appear after the next
        rebuild; it's visible immediately via the live site in the meantime.
      </p>

      <Card title={editingId ? 'Edit category' : 'Add a new category'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Slug (used in the URL, e.g. video-tools)">
              <input style={inputStyle} required disabled={Boolean(editingId)} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
            </Field>
            <Field label="Display name">
              <input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <input style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Icon key (lucide-react name)">
              <input style={inputStyle} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </Field>
            <Field label="Color theme">
              <select style={inputStyle} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}</AdminButton>
            {editingId && <AdminButton type="button" variant="secondary" onClick={cancelEdit}>Cancel</AdminButton>}
          </div>
        </form>
      </Card>

      <Card title={`All categories (${categories.length})`}>
        {loading ? (
          <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
        ) : (
          <Table
            columns={['Name', 'Slug', 'Color', 'Order', 'Actions']}
            rows={[...categories].sort((a, b) => a.sort_order - b.sort_order)}
            renderRow={(c) => (
              <>
                <td style={cellStyle}>{c.name}</td>
                <td style={{ ...cellStyle, color: 'var(--col-text3)', fontFamily: 'monospace' }}>{c.slug}</td>
                <td style={cellStyle}>{c.color}</td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <AdminButton variant="secondary" onClick={() => move(c, -1)}>↑</AdminButton>
                    <AdminButton variant="secondary" onClick={() => move(c, 1)}>↓</AdminButton>
                  </div>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <AdminButton variant="secondary" onClick={() => startEdit(c)}>Edit</AdminButton>
                    <AdminButton variant="danger" onClick={() => handleDelete(c)}>Delete</AdminButton>
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
