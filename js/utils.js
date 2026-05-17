/* ════════════════════════════════════════════════════════
   IMAGEYANTRA — SHARED UTILITIES v5
   Fix: file picker opening twice on click
   Root cause: input covers entire drop-zone (position:absolute;inset:0)
   so every click lands on the input, not the zone.
   Solution: let the input handle clicks natively (it already opens the
   picker on its own). The zone click handler is only needed as a fallback
   for browsers that don't fire click on the input when the zone is clicked.
   We remove the zone→input delegation entirely and rely on the native
   input click behaviour + change event. This is simpler and 100% reliable.
════════════════════════════════════════════════════════ */

/* Toast */
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 2800);
}

/* Format file size */
function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/* Estimate dataURL size in bytes */
function dataURLSize(dataUrl) {
  const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
  return Math.round(base64.length * 3 / 4);
}

/* Load image from src (Promise) */
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/* Read File as dataURL (Promise) */
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* Trigger download from dataURL */
function downloadDataURL(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* Save record to localStorage */
function saveFile(name, dataUrl, type) {
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('imageyantra_files') || '[]'); } catch(e) {}
  saved.unshift({ name, dataUrl, type, size: dataURLSize(dataUrl), date: new Date().toISOString() });
  if (saved.length > 30) saved.length = 30;
  try { localStorage.setItem('imageyantra_files', JSON.stringify(saved)); } catch(e) {}
  toast('Saved: ' + name, 'success');
}

/* ── FILE PICKER: why the "double open" happened ──────────────
   The input has CSS: position:absolute; inset:0; opacity:0
   This means the input covers the ENTIRE drop zone.
   Every click on the zone is actually a click directly ON the input.

   Old code did:  zone.click → input.click()
   But the user's click already landed on input → browser opens picker.
   Then zone.click fired too → input.click() again → double open.

   Fix: remove the zone→input delegation. The input opens the picker
   natively because it covers the whole zone. The zone only needs
   drag-and-drop handlers and keyboard accessibility (for Tab users
   who focus the zone element, not the input).
──────────────────────────────────────────────────────────── */

/* Generic drop zone setup (images) */
function setupDropZone(zoneId, inputId, multiple, callback) {
  const zone  = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  /* A11y: zone is focusable for keyboard users.
     Pressing Enter/Space on the focused zone opens the picker. */
  zone.setAttribute('role', 'button');
  zone.setAttribute('tabindex', '0');
  zone.setAttribute('aria-label', 'Upload image — click or drag and drop');

  zone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  /* Drag & drop */
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length) callback(multiple ? files : [files[0]]);
    else toast('Please drop image files only', 'error');
  });

  /* File selected via native input click (the input covers the whole zone) */
  input.addEventListener('change', e => {
    const files = [...e.target.files];
    if (files.length) callback(multiple ? files : [files[0]]);
    e.target.value = ''; /* reset so same file can be re-selected */
  });
}

/* PDF drop zone setup */
function setupPdfDropZone(zoneId, inputId, callback) {
  const zone  = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.setAttribute('role', 'button');
  zone.setAttribute('tabindex', '0');
  zone.setAttribute('aria-label', 'Upload PDF — click or drag and drop');

  zone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter(f => f.type === 'application/pdf');
    if (files.length) callback(files);
    else toast('Please drop PDF files only', 'error');
  });

  input.addEventListener('change', e => {
    const files = [...e.target.files];
    if (files.length) callback(files);
    e.target.value = '';
  });
}
