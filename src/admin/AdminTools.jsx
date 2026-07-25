import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle, Table } from './AdminUI.jsx';

const EMPTY_FORM = {
  slug: '', name: '', desc: '', category_slug: '', icon: 'file-output',
  seo_title: '', meta_description: '', faqs: [],
};

export default function AdminTools() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([adminApi.listTools(), adminApi.listCategories()])
      .then(([t, c]) => { setTools(t); setCategories(c); if (!form.category_slug && c[0]) setForm((f) => ({ ...f, category_slug: c[0].slug })); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(tool) {
    setEditingId(tool.id);
    setForm({
      slug: tool.slug, name: tool.name, desc: tool.desc || '',
      category_slug: tool.category_slug || categories[0]?.slug || '',
      icon: tool.icon || 'file-output',
      seo_title: tool.seo_title || '', meta_description: tool.meta_description || '',
      faqs: tool.faqs || [],
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category_slug: categories[0]?.slug || '' });
  }

  function updateFaq(i, key, value) {
    const faqs = form.faqs.slice();
    faqs[i] = { ...faqs[i], [key]: value };
    setForm({ ...form, faqs });
  }
  function addFaq() { setForm({ ...form, faqs: [...form.faqs, { q: '', a: '' }] }); }
  function removeFaq(i) { setForm({ ...form, faqs: form.faqs.filter((_, idx) => idx !== i) }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await adminApi.updateTool(editingId, form);
      } else {
        await adminApi.createTool(form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(tool) {
    await adminApi.updateTool(tool.id, { active: !tool.active });
    load();
  }

  async function handleDelete(tool) {
    if (!window.confirm(`Delete "${tool.name}"? This removes it from the live site immediately.`)) return;
    await adminApi.deleteTool(tool.id);
    load();
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 800, color: 'var(--col-text)', marginBottom: 'var(--sp-6)' }}>
        Tools
      </h1>

      <Card title={editingId ? 'Edit tool' : 'Add a new tool'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Slug (used in the URL, e.g. compress-image)">
              <input style={inputStyle} required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Display name">
              <input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
          </div>
          <Field label="Short description">
            <input style={inputStyle} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Category">
              <select style={inputStyle} value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Icon key (lucide-react name)">
              <input style={inputStyle} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </Field>
          </div>

          <Card title="SEO" style={{ background: 'var(--col-bg2, #fafafa)', boxShadow: 'none' }}>
            <Field label="SEO title (leave blank to use the display name)">
              <input style={inputStyle} value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
            </Field>
            <Field label="Meta description">
              <input style={inputStyle} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
            </Field>
          </Card>

          <Card title="FAQs" action={<AdminButton type="button" variant="secondary" onClick={addFaq}>+ Add FAQ</AdminButton>} style={{ background: 'var(--col-bg2, #fafafa)', boxShadow: 'none' }}>
            {form.faqs.length === 0 && <p style={{ color: 'var(--col-text3)', fontSize: 13 }}>No FAQs yet.</p>}
            {form.faqs.map((faq, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Question" value={faq.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} />
                  <textarea style={{ ...inputStyle, minHeight: 50 }} placeholder="Answer" value={faq.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} />
                </div>
                <AdminButton type="button" variant="danger" onClick={() => removeFaq(i)}>✕</AdminButton>
              </div>
            ))}
          </Card>

          {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add tool'}</AdminButton>
            {editingId && <AdminButton type="button" variant="secondary" onClick={cancelEdit}>Cancel</AdminButton>}
          </div>
        </form>
      </Card>

      <UploadToolCodePanel categories={categories} onDone={load} />

      <Card title={`All tools (${tools.length})`}>
        {loading ? (
          <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
        ) : (
          <Table
            columns={['Name', 'Slug', 'Category', 'Build', 'Status', 'Actions']}
            rows={tools}
            renderRow={(t) => (
              <>
                <td style={cellStyle}>{t.name}</td>
                <td style={{ ...cellStyle, color: 'var(--col-text3)', fontFamily: 'monospace' }}>{t.slug}</td>
                <td style={cellStyle}>{categories.find((c) => c.slug === t.category_slug)?.name || t.category_slug}</td>
                <td style={cellStyle}>
                  {t.component_path ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.build_status === 'live' ? 'var(--col-green)' : 'var(--col-text3)' }}>
                      {t.build_status === 'live' ? 'Live' : 'Building…'}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--col-text3)' }}>—</span>
                  )}
                </td>
                <td style={cellStyle}>
                  <button
                    onClick={() => toggleActive(t)}
                    style={{
                      border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: t.active !== false ? 'var(--col-green-bg, #e7f7ee)' : 'var(--col-red-bg)',
                      color: t.active !== false ? 'var(--col-green)' : 'var(--col-red)',
                    }}
                  >
                    {t.active !== false ? 'Live' : 'Hidden'}
                  </button>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <AdminButton variant="secondary" onClick={() => startEdit(t)}>Edit</AdminButton>
                    <AdminButton variant="danger" onClick={() => handleDelete(t)}>Delete</AdminButton>
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

/**
 * Upload-a-tool: commits a working .jsx component file to the site's
 * GitHub repo and triggers a rebuild. See the Edge Function
 * supabase/functions/upload-tool for what happens server-side.
 *
 * IMPORTANT (shown to the admin too, not just in code comments): this
 * does not generate a working tool from nothing — the uploaded file must
 * already be a real, working React component (written by you or a
 * developer) that follows the existing tool-page contract. What this
 * removes is only the manual step of a developer wiring it into the
 * router by hand.
 */
function UploadToolCodePanel({ categories, onDone }) {
  const [file, setFile] = useState(null);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !slug || !name) { setError('Choose a file and fill in slug + name.'); return; }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const componentSource = await file.text();
      const pascalName = slug.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
      const fileName = `${pascalName}Page.jsx`;
      const res = await adminApi.uploadToolCode({ slug, name, categorySlug, componentSource, fileName });
      setResult(res);
      setFile(null); setSlug(''); setName('');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Upload a new tool's code">
      <p style={{ fontSize: 13, color: 'var(--col-text2)', marginBottom: 'var(--sp-4)' }}>
        Upload a working <code>.jsx</code> component (default export, following the
        existing tool-page contract). It's committed to the repo and a rebuild is
        triggered automatically — no developer needs to wire it into the router.
        The uploaded file must already contain real, working logic; this doesn't
        generate a tool from nothing.
      </p>
      <form onSubmit={handleUpload}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <Field label="Slug (URL, e.g. my-new-tool)">
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field label="Display name">
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        </div>
        <Field label="Category">
          <select style={inputStyle} value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
            <option value="">— none —</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Component file (.jsx)">
          <input style={inputStyle} type="file" accept=".jsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Field>
        {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}
        {result && <p style={{ color: 'var(--col-green)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>Committed! Rebuild triggered — it'll go live in a couple of minutes.</p>}
        <AdminButton type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Commit & rebuild'}</AdminButton>
      </form>
    </Card>
  );
}

const cellStyle = { padding: '10px', verticalAlign: 'middle' };
