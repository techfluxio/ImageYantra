import { useRef, useState } from 'react';
import { adminApi } from './adminApi.js';
import { Card, AdminButton } from './AdminUI.jsx';

export default function AdminBackup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  async function handleExport() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await adminApi.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imageyantra-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Backup downloaded.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('This will overwrite matching rows (by slug/id) in your database with the contents of this backup file. Continue?')) {
      e.target.value = '';
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      await adminApi.restoreData(backup);
      setMessage('Backup restored successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 800, color: 'var(--col-text)', marginBottom: 'var(--sp-6)' }}>
        Backup &amp; Restore
      </h1>

      <Card title="Export a backup">
        <p style={{ fontSize: 13, color: 'var(--col-text2)', marginBottom: 'var(--sp-4)' }}>
          Downloads all your admin-managed content — tools, categories, blog posts, footer links, ad
          placements, settings, and pages — as one JSON file. Analytics and glitch reports aren't
          included (they're logs, not content). Keep this file somewhere safe.
        </p>
        <AdminButton onClick={handleExport} disabled={busy}>{busy ? 'Working…' : 'Download backup'}</AdminButton>
      </Card>

      <Card title="Restore from a backup">
        <p style={{ fontSize: 13, color: 'var(--col-text2)', marginBottom: 'var(--sp-4)' }}>
          <strong>Careful:</strong> this overwrites any existing rows that share the same slug/ID with
          what's in the backup file. It won't delete content that was added after the backup was made.
        </p>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleRestore} disabled={busy} />
      </Card>

      {error && <p style={{ color: 'var(--col-red)', fontSize: 13 }}>{error}</p>}
      {message && <p style={{ color: 'var(--col-green)', fontSize: 13 }}>{message}</p>}
    </div>
  );
}