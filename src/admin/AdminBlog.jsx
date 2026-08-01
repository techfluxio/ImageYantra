import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle, Table, PageHeader } from './AdminUI.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import { Newspaper } from 'lucide-react';

const EMPTY_FORM = { title: '', slug: '', excerpt: '', body: '', category: 'Image', author: 'ImageYantra Team', published: true };

/** Must exactly match the keys in blogCategoryClass() / BlogListPage's
 *  CATEGORY_STYLE — these are what actually color-code and icon the
 *  category badge everywhere blog posts are shown. */
const BLOG_CATEGORIES = ['Image', 'PDF', 'Exam', 'Social', 'ID Photo Sizes', 'Other'];

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminApi.listBlogPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(post) {
    setEditingId(post.id);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || '', body: post.body || '',
      category: post.category || 'Image', author: post.author || 'ImageYantra Team', published: post.published !== false,
    });
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
      const payload = {
        ...form,
        slug: form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
      if (editingId) {
        await adminApi.updateBlogPost(editingId, payload);
      } else {
        await adminApi.createBlogPost(payload);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(post) {
    await adminApi.updateBlogPost(post.id, { published: !post.published });
    load();
  }

  async function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    await adminApi.deleteBlogPost(post.id);
    load();
  }

  return (
    <div>
      <PageHeader icon={Newspaper} title="Blog" />

      <Card title={editingId ? 'Edit post' : 'Write a new post'}>
        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <input style={inputStyle} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="URL slug (optional — auto-generated from title if left blank)">
              <input style={inputStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" />
            </Field>
            <Field label="Category">
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Author">
              <input style={inputStyle} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </Field>
          </div>
          <Field label="Excerpt (shown on the blog list page)">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </Field>
          <Field label="Body">
            <RichTextEditor value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 'var(--sp-4)', color: 'var(--col-text2)' }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published (visible on the live site)
          </label>

          {error && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish post'}</AdminButton>
            {editingId && <AdminButton type="button" variant="secondary" onClick={cancelEdit}>Cancel</AdminButton>}
          </div>
        </form>
      </Card>

      <Card title={`All posts (${posts.length})`}>
        {loading ? (
          <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
        ) : (
          <Table
            columns={['Title', 'Category', 'Date', 'Status', 'Actions']}
            rows={posts}
            renderRow={(p) => (
              <>
                <td style={cellStyle}>{p.title}</td>
                <td style={cellStyle}>{p.category}</td>
                <td style={{ ...cellStyle, color: 'var(--col-text3)' }}>{p.date}</td>
                <td style={cellStyle}>
                  <button
                    onClick={() => togglePublished(p)}
                    style={{
                      border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: p.published !== false ? 'var(--col-green-bg, #e7f7ee)' : 'var(--col-red-bg)',
                      color: p.published !== false ? 'var(--col-green)' : 'var(--col-red)',
                    }}
                  >
                    {p.published !== false ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <AdminButton variant="secondary" onClick={() => startEdit(p)}>Edit</AdminButton>
                    <AdminButton variant="danger" onClick={() => handleDelete(p)}>Delete</AdminButton>
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