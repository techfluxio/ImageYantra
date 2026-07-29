import { useEffect, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton, Field, inputStyle, Table, PageHeader } from './AdminUI.jsx';
import { Megaphone } from 'lucide-react';

const AD_FORMATS = ['auto', 'rectangle', 'horizontal', 'vertical'];
const EMPTY_NEW_PLACEMENT = { placement: '', label: '', slot: '', ad_format: 'auto', enabled: false };

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRow, setEditingRow] = useState(null); // { id, slot, label }
  const [newPlacement, setNewPlacement] = useState(EMPTY_NEW_PLACEMENT);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  function load() {
    setLoading(true);
    adminApi.listAds()
      .then(setAds)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleEnabled(ad) {
    await adminApi.updateAd(ad.id, { enabled: !ad.enabled });
    load();
  }

  async function saveEdit() {
    await adminApi.updateAd(editingRow.id, { slot: editingRow.slot, label: editingRow.label });
    setEditingRow(null);
    load();
  }

  async function handleDelete(ad) {
    if (!window.confirm(`Remove the "${ad.label}" placement? Only do this if no code still references placement="${ad.placement}".`)) return;
    await adminApi.deleteAd(ad.id);
    load();
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await adminApi.createAd(newPlacement);
      setNewPlacement(EMPTY_NEW_PLACEMENT);
      load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={Megaphone}
        title="Ads"
        description="Manage AdSense slot IDs and toggle ad placements on/off across the site — changes take effect immediately, no redeploy needed."
      />

      <Card title="Register a new ad placement">
        <p style={{ fontSize: 13, color: 'var(--col-text2)', marginBottom: 'var(--sp-4)' }}>
          <strong>Important:</strong> this is not a page-builder — it doesn't add an ad slot to a
          brand-new spot on any page. It only manages a placement <em>a developer has already wired
          into the code</em> (e.g. <code>&lt;AdBanner placement="my-new-spot" /&gt;</code>). Enter the
          exact same placement key used there; after that, on/off, slot ID, and size are fully
          manageable here with no further code.
        </p>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label='Placement key (must match the code exactly)'>
              <input style={inputStyle} required value={newPlacement.placement} onChange={(e) => setNewPlacement({ ...newPlacement, placement: e.target.value })} />
            </Field>
            <Field label="Label (for your reference)">
              <input style={inputStyle} required value={newPlacement.label} onChange={(e) => setNewPlacement({ ...newPlacement, label: e.target.value })} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Field label="Ad slot ID (from AdSense, optional for now)">
              <input style={inputStyle} value={newPlacement.slot} onChange={(e) => setNewPlacement({ ...newPlacement, slot: e.target.value })} />
            </Field>
            <Field label="Ad format">
              <select style={inputStyle} value={newPlacement.ad_format} onChange={(e) => setNewPlacement({ ...newPlacement, ad_format: e.target.value })}>
                {AD_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>
          {createError && <p style={{ color: 'var(--col-red)', fontSize: 13, marginBottom: 'var(--sp-3)' }}>{createError}</p>}
          <AdminButton type="submit" disabled={creating}>{creating ? 'Registering…' : 'Register placement'}</AdminButton>
        </form>
      </Card>

      <Card title="All placements">
        {loading ? (
          <p style={{ color: 'var(--col-text2)' }}>Loading…</p>
        ) : error ? (
          <p style={{ color: 'var(--col-red)' }}>{error}</p>
        ) : (
          <Table
            columns={['Placement', 'Ad slot ID', 'Status', 'Actions']}
            rows={ads}
            renderRow={(ad) => (
              <>
                <td style={cellStyle}>
                  <div style={{ fontWeight: 600 }}>{ad.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--col-text3)', fontFamily: 'monospace' }}>{ad.placement}</div>
                </td>
                <td style={cellStyle}>
                  {editingRow?.id === ad.id ? (
                    <input
                      style={{ ...inputStyle, width: 160 }}
                      value={editingRow.slot}
                      onChange={(e) => setEditingRow({ ...editingRow, slot: e.target.value })}
                    />
                  ) : (
                    <span style={{ fontFamily: 'monospace', color: 'var(--col-text2)' }}>{ad.slot}</span>
                  )}
                </td>
                <td style={cellStyle}>
                  <button
                    onClick={() => toggleEnabled(ad)}
                    style={{
                      border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: ad.enabled !== false ? 'var(--col-green-bg, #e7f7ee)' : 'var(--col-red-bg)',
                      color: ad.enabled !== false ? 'var(--col-green)' : 'var(--col-red)',
                    }}
                  >
                    {ad.enabled !== false ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editingRow?.id === ad.id ? (
                      <>
                        <AdminButton onClick={saveEdit}>Save</AdminButton>
                        <AdminButton variant="secondary" onClick={() => setEditingRow(null)}>Cancel</AdminButton>
                      </>
                    ) : (
                      <AdminButton variant="secondary" onClick={() => setEditingRow({ id: ad.id, slot: ad.slot, label: ad.label })}>
                        Edit slot ID
                      </AdminButton>
                    )}
                    <AdminButton variant="danger" onClick={() => handleDelete(ad)}>Delete</AdminButton>
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