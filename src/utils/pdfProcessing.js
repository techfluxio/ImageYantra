/**
 * pdfProcessing.js
 * ────────────────────────────────────────────────────────────────
 * Real, in-browser PDF engine backing every /tools/*-pdf page.
 *
 * pdf-lib does all structural edits (merge, reorder, remove/extract
 * pages, embed images) — these are 100% lossless, page content is
 * copied byte-for-byte, nothing is rasterized.
 *
 * pdf.js (loaded once from CDN, same pattern as the rest of the site)
 * is used only for *rendering* — page thumbnails and blank-page
 * detection — never for the actual output file.
 *
 * No file is ever uploaded anywhere; everything happens on-device.
 */

let _pdfjsPromise = null;
export async function loadPdfJs() {
  if (_pdfjsPromise) return _pdfjsPromise;
  _pdfjsPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    s.onerror = () => reject(new Error('Could not load the PDF engine. Check your connection and try again.'));
    document.head.appendChild(s);
  });
  return _pdfjsPromise;
}

export async function loadPdfLib() {
  // A fork of pdf-lib with real PDF encryption support (`doc.encrypt(...)`)
  // bolted on, otherwise fully API-compatible — used everywhere pdf-lib
  // was used before, so Lock PDF gets real encryption without shipping a
  // second copy of the PDF engine.
  return import('pdf-lib-plus-encrypt');
}

export function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Save a Blob via the native "Save As" dialog (path + rename); falls
 * back to a normal download only in browsers without the API. */
export async function saveBlob(blob, filename) {
  if (typeof window !== 'undefined' && window.showSaveFilePicker) {
    try {
      const dotIdx = filename.lastIndexOf('.');
      const ext = dotIdx > -1 ? filename.slice(dotIdx) : '';
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'File', accept: { [blob.type || 'application/octet-stream']: ext ? [ext] : [] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return 'saved';
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); try { document.body.removeChild(a); } catch { /* noop */ } }, 60000);
  return 'fallback';
}

/* ════════════════════════════════════════════════════════════
   THUMBNAILS — render each page to a small PNG for pick/reorder UIs
════════════════════════════════════════════════════════════ */

/** @returns {Promise<{count:number, thumbs:string[]}>} */
export async function renderPdfThumbnails(file, { maxWidth = 220 } = {}) {
  const pdfjsLib = await loadPdfJs();
  const buf = await readFileAsArrayBuffer(file);
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const thumbs = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = maxWidth / vp1.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbs.push(canvas.toDataURL('image/png'));
  }
  return { count: doc.numPages, thumbs };
}

/** Renders just the first page of an in-memory PDF Blob to a data URL —
 * used to show a real document preview on tool result pages instead of
 * a generic file icon. Returns null if the blob isn't a renderable PDF
 * (e.g. a zip of split files) or rendering fails for any reason. */
export async function renderPdfBlobThumbnail(blob, { maxWidth = 160 } = {}) {
  if (!blob || blob.type !== 'application/pdf') return null;
  try {
    const pdfjsLib = await loadPdfJs();
    const buf = await blob.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    const page = await doc.getPage(1);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = maxWidth / vp1.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

/** Renders each page small and flags pages whose non-white pixel
 * ratio is below `threshold` (i.e. effectively blank). */
export async function detectBlankPages(file, { threshold = 0.004 } = {}) {
  const pdfjsLib = await loadPdfJs();
  const buf = await readFileAsArrayBuffer(file);
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const blankIdx = [];
  const thumbs = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbs.push(canvas.toDataURL('image/png'));
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nonWhite = 0;
    for (let p = 0; p < data.length; p += 4) {
      if (data[p] < 250 || data[p + 1] < 250 || data[p + 2] < 250) nonWhite++;
    }
    const ratio = nonWhite / (data.length / 4);
    if (ratio < threshold) blankIdx.push(i - 1);
  }
  return { count: doc.numPages, thumbs, blankIdx };
}

/* ════════════════════════════════════════════════════════════
   PDF → JPG — rasterize every page to a full-resolution JPG
════════════════════════════════════════════════════════════ */

/**
 * Renders every page of a PDF to a standalone JPG data URL at a
 * print-quality resolution (independent of the small preview
 * thumbnails used elsewhere).
 * @param {File} file
 * @param {{scale?:number, quality?:number}} opts scale ~2 ≈ 192 DPI, ~3 ≈ 288 DPI
 * @returns {Promise<{count:number, pages:{dataUrl:string, width:number, height:number, size:number}[]}>}
 */
export async function pdfToJpgs(file, { scale = 2, quality = 0.92 } = {}, onProg = () => {}) {
  const pdfjsLib = await loadPdfJs();
  const buf = await readFileAsArrayBuffer(file);
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    onProg(Math.round((i / doc.numPages) * 100), `Rendering page ${i} of ${doc.numPages}…`);
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const size = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
    pages.push({ dataUrl, width: canvas.width, height: canvas.height, size });
  }
  return { count: doc.numPages, pages };
}

/* ════════════════════════════════════════════════════════════
   LOSSLESS STRUCTURAL EDITS (pdf-lib) — merge / reorder / remove / extract
════════════════════════════════════════════════════════════ */

async function loadDoc(PDFDocument, file) {
  const buf = await readFileAsArrayBuffer(file);
  return PDFDocument.load(buf, { ignoreEncryption: true });
}

export async function mergePdfs(files, onProg = () => {}) {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    onProg(Math.round((i / files.length) * 80), `Adding ${files[i].name}…`);
    const src = await loadDoc(PDFDocument, files[i]);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  onProg(90, 'Finalizing…');
  return await finalizeAndBand(out, { minKB: 200, maxKB: 500 }, onProg);
}

export async function reorderPdf(file, newOrder, onProg = () => {}) {
  const { PDFDocument } = await loadPdfLib();
  const src = await loadDoc(PDFDocument, file);
  const out = await PDFDocument.create();
  onProg(30, 'Reordering pages…');
  const pages = await out.copyPages(src, newOrder);
  pages.forEach((p) => out.addPage(p));
  onProg(80, 'Finalizing…');
  return await finalizeAndBand(out, { minKB: 200, maxKB: 500 }, onProg);
}

export async function removePdfPages(file, removeIdxSet, onProg = () => {}) {
  const { PDFDocument } = await loadPdfLib();
  const src = await loadDoc(PDFDocument, file);
  const keep = src.getPageIndices().filter((i) => !removeIdxSet.has(i));
  const out = await PDFDocument.create();
  onProg(30, 'Removing pages…');
  const pages = await out.copyPages(src, keep);
  pages.forEach((p) => out.addPage(p));
  onProg(80, 'Finalizing…');
  return await finalizeAndBand(out, { minKB: 200, maxKB: 500 }, onProg);
}

export async function extractPdfPages(file, keepIdxList, onProg = () => {}) {
  const { PDFDocument } = await loadPdfLib();
  const src = await loadDoc(PDFDocument, file);
  const out = await PDFDocument.create();
  onProg(30, 'Extracting pages…');
  const pages = await out.copyPages(src, keepIdxList);
  pages.forEach((p) => out.addPage(p));
  onProg(80, 'Finalizing…');
  return await finalizeAndBand(out, { minKB: 200, maxKB: 500 }, onProg);
}

export async function removeBlankPagesFromPdf(file, blankIdxSet, onProg = () => {}) {
  return removePdfPages(file, blankIdxSet, onProg);
}

/** Split into groups of `pagesPerFile` pages, returned as a zip Blob. */
export async function splitPdf(file, pagesPerFile, onProg = () => {}) {
  const { PDFDocument } = await loadPdfLib();
  const JSZip = (await import('jszip')).default;
  const src = await loadDoc(PDFDocument, file);
  const total = src.getPageCount();
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');
  let part = 1;
  for (let start = 0; start < total; start += pagesPerFile) {
    const idx = [];
    for (let p = start; p < Math.min(start + pagesPerFile, total); p++) idx.push(p);
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, idx);
    pages.forEach((p) => out.addPage(p));
    const bytes = await out.save({ useObjectStreams: true });
    const { blob: partBlob } = await capPdfUnder500KB(new Blob([bytes], { type: 'application/pdf' }), onProg);
    zip.file(`${baseName}-part${part}.pdf`, await partBlob.arrayBuffer());
    part++;
    onProg(Math.round((start / total) * 90), `Building part ${part - 1}…`);
  }
  onProg(95, 'Zipping…');
  const blob = await zip.generateAsync({ type: 'blob' });
  return { blob, finalSize: blob.size, parts: part - 1 };
}

/* Standard page sizes in PDF points (1pt = 1/72in), portrait orientation. */
export const PDF_PAGE_SIZES = {
  a4:     { label: 'A4 (297x210 mm)',     width: 595.28, height: 841.89 },
  letter: { label: 'Letter (11x8.5 in)',  width: 612,    height: 792 },
  legal:  { label: 'Legal (14x8.5 in)',   width: 612,    height: 1008 },
  a3:     { label: 'A3 (420x297 mm)',     width: 841.89, height: 1190.55 },
  a5:     { label: 'A5 (210x148 mm)',     width: 419.53, height: 595.28 },
};

/* Margin presets in points, applied on every side. */
export const PDF_MARGINS = {
  none:  0,
  small: 24,
  big:   64,
};

/**
 * Turn one or more JPG/PNG images into a single PDF (one image per page).
 * @param {File[]} files
 * @param {(pct:number, msg:string)=>void} onProg
 * @param {{pageSize?: 'fit'|'a4'|'letter'|'legal'|'a3'|'a5', orientation?: 'portrait'|'landscape', margin?: 'none'|'small'|'big'}} [settings]
 */
export async function imagesToPdf(files, onProg = () => {}, settings = {}) {
  const { pageSize = 'fit', orientation = 'portrait', margin = 'none' } = settings;
  const marginPt = PDF_MARGINS[margin] ?? 0;
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    onProg(Math.round((i / files.length) * 85), `Adding ${files[i].name}…`);
    const bytes = await readFileAsArrayBuffer(files[i]);
    const isPng = /png$/i.test(files[i].type) || /\.png$/i.test(files[i].name);
    const img = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes);

    // Base page dimensions: either the image's own size ("fit"), or a
    // standard paper size.
    let pageW, pageH;
    if (pageSize === 'fit') {
      pageW = img.width;
      pageH = img.height;
    } else {
      const preset = PDF_PAGE_SIZES[pageSize] || PDF_PAGE_SIZES.a4;
      pageW = preset.width;
      pageH = preset.height;
    }

    // Orientation: force the width/height relationship to match the choice.
    if (orientation === 'landscape' && pageW < pageH) {
      [pageW, pageH] = [pageH, pageW];
    } else if (orientation === 'portrait' && pageW > pageH) {
      [pageW, pageH] = [pageH, pageW];
    }

    const page = out.addPage([pageW, pageH]);

    // Fit the image inside the margined content box, preserving aspect ratio.
    const contentW = Math.max(1, pageW - marginPt * 2);
    const contentH = Math.max(1, pageH - marginPt * 2);
    const scale = Math.min(contentW / img.width, contentH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;
    page.drawImage(img, { x, y, width: drawW, height: drawH });
  }
  onProg(90, 'Finalizing…');
  const pdfBytes = await out.save({ useObjectStreams: true });
  return await capPdfUnder500KB(new Blob([pdfBytes], { type: 'application/pdf' }), onProg);
}

/** Best-effort: removes owner-password restrictions (printing/copying/
 * editing locks) from a PDF that already opens without a password.
 *
 * pdf-lib itself has no PDF decryption implementation — passing
 * `ignoreEncryption: true` only suppresses its "this is encrypted" check,
 * it does NOT decrypt the underlying content streams. Simply re-saving
 * an encrypted document with pdf-lib produces a corrupt file. So: for
 * files that aren't actually encrypted, pdf-lib can safely pass them
 * through losslessly. For genuinely encrypted files, every page is
 * rendered with pdf.js (which does implement real RC4/AES decryption)
 * and reassembled into a brand-new, unencrypted PDF — this reliably
 * strips every restriction, at the cost of rasterizing the page content.
 */
/**
 * Adds real password protection to a PDF: a user password required to open
 * it, and an optional separate owner password that grants full access
 * while still restricting what a regular viewer can do (print/copy/edit).
 * @param {File} file
 * @param {{password: string, permissions?: {printing?: boolean, copying?: boolean, modifying?: boolean, annotating?: boolean}}} opts
 */
export async function encryptPdf(file, onProg = () => {}, opts = {}) {
  const { password, permissions = {} } = opts;
  const { PDFDocument } = await loadPdfLib();
  onProg(15, 'Reading file…');
  let src = await loadDoc(PDFDocument, file);

  // Cap the *unencrypted* source under 500KB first — a PDF's content
  // can't be safely rasterized once it's password-protected, so this
  // has to happen before encrypt() runs.
  const probeBytes = await src.save({ useObjectStreams: true });
  if (probeBytes.length > 490 * 1024) {
    onProg(30, 'Optimizing size to stay under 500KB…');
    const probeFile = new File([new Blob([probeBytes], { type: 'application/pdf' })], 'doc.pdf', { type: 'application/pdf' });
    const { blob: compressedBlob } = await rasterCompressPdf(probeFile, { minBytes: 0, maxBytes: 490 * 1024 }, onProg);
    const compressedBuf = await compressedBlob.arrayBuffer();
    src = await PDFDocument.load(compressedBuf, { ignoreEncryption: true });
  }

  onProg(55, 'Encrypting…');
  await src.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: permissions.printing === false ? false : 'highResolution',
      copying: permissions.copying !== false,
      modifying: permissions.modifying === false ? false : true,
      annotating: permissions.annotating === false ? false : true,
    },
  });
  onProg(90, 'Finalizing…');
  const pdfBytes = await src.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  onProg(100, 'Done');
  return { blob, finalSize: blob.size };
}

export async function unlockPdf(file, onProg = () => {}) {
  const { PDFDocument } = await loadPdfLib();
  onProg(10, 'Reading file…');
  const buf = await readFileAsArrayBuffer(file);

  let isEncrypted = false;
  try {
    const probe = await PDFDocument.load(buf.slice(0), { ignoreEncryption: true });
    isEncrypted = probe.isEncrypted;
  } catch {
    isEncrypted = true; // couldn't even probe it — treat as encrypted, try the pdf.js path
  }

  if (!isEncrypted) {
    onProg(60, 'Finalizing…');
    const src = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pdfBytes = await src.save({ useObjectStreams: true });
    return await capPdfUnder500KB(new Blob([pdfBytes], { type: 'application/pdf' }), onProg);
  }

  onProg(20, 'Decrypting pages…');
  const pdfjsLib = await loadPdfJs();
  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
  } catch {
    throw new Error('This PDF requires a password to open, which we can\u2019t bypass.');
  }

  const out = await PDFDocument.create();
  const scale = 2; // ~192 DPI — sharp for both text-heavy and scanned pages
  for (let i = 1; i <= doc.numPages; i++) {
    onProg(20 + Math.round((i / doc.numPages) * 70), `Decrypting page ${i} of ${doc.numPages}…`);
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
    const jpegBytes = Uint8Array.from(atob(jpegUrl.split(',')[1]), (c) => c.charCodeAt(0));
    const img = await out.embedJpg(jpegBytes);
    const pdfPage = out.addPage([canvas.width, canvas.height]);
    pdfPage.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
  }
  onProg(95, 'Finalizing…');
  const pdfBytes = await out.save({ useObjectStreams: true });
  return await capPdfUnder500KB(new Blob([pdfBytes], { type: 'application/pdf' }), onProg);
}

/* ════════════════════════════════════════════════════════════
   SIZE BAND — lossless first, automatic high-quality fallback
════════════════════════════════════════════════════════════ */

/**
 * Saves a pdf-lib document with maximum lossless compaction
 * (object streams). If it's still above maxKB (e.g. the source PDF
 * embeds large, already-lossy scans), automatically rasterizes each
 * page at a high DPI and re-encodes at near-maximum JPEG quality —
 * visually lossless — and binary-searches quality/DPI until the file
 * lands inside [minKB, maxKB]. Only ever engages this fallback when
 * lossless alone can't hit the target.
 */
async function finalizeAndBand(pdfLibDoc, { minKB, maxKB }, onProg = () => {}) {
  const losslessBytes = await pdfLibDoc.save({ useObjectStreams: true });
  const losslessSize = losslessBytes.length;
  const maxBytes = maxKB * 1024;

  if (losslessSize <= maxBytes) {
    return { blob: new Blob([losslessBytes], { type: 'application/pdf' }), finalSize: losslessSize, rasterized: false };
  }

  // Fallback: the file is genuinely large (image-heavy scan) — rasterize
  // at high quality so it fits the band without visible degradation.
  onProg(85, 'Optimizing size (high-quality pass)…');
  const srcBlob = new Blob([losslessBytes], { type: 'application/pdf' });
  const srcFile = new File([srcBlob], 'doc.pdf', { type: 'application/pdf' });
  const result = await rasterCompressPdf(srcFile, { minBytes: minKB * 1024, maxBytes }, onProg);
  return { ...result, rasterized: true };
}

/**
 * Shared "every PDF download stays under 500KB" guarantee. Pass any
 * already-built PDF blob through this before handing it to the result
 * screen — if it's already under the cap it's returned untouched
 * (lossless), otherwise it's rasterized down to fit, the same
 * high-quality fallback every other PDF tool on the site uses.
 */
export async function capPdfUnder500KB(blob, onProg = () => {}) {
  const maxBytes = 500 * 1024;
  if (blob.size <= maxBytes) {
    return { blob, finalSize: blob.size, rasterized: false };
  }
  onProg(85, 'Optimizing size to stay under 500KB…');
  const file = new File([blob], 'doc.pdf', { type: 'application/pdf' });
  const result = await rasterCompressPdf(file, { minBytes: 0, maxBytes }, onProg);
  return { ...result, rasterized: true };
}

/**
 * Rasterizes every page to a canvas and re-encodes the whole document
 * as a new PDF of JPEG pages, binary-searching a single DPI/quality
 * pair so the total size lands in [minBytes, maxBytes]. Used directly
 * by Compress PDF / Compress-under-100KB / Compress-under-500KB, and
 * as the automatic fallback above for organize tools on huge inputs.
 */
export async function rasterCompressPdf(file, { minBytes, maxBytes }, onProg = () => {}) {
  const pdfjsLib = await loadPdfJs();
  const { PDFDocument } = await loadPdfLib();
  const buf = await readFileAsArrayBuffer(file);
  const doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
  const pageCount = doc.numPages;

  async function buildAt(scale, quality) {
    const out = await PDFDocument.create();
    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const jpegUrl = canvas.toDataURL('image/jpeg', quality);
      const jpegBytes = Uint8Array.from(atob(jpegUrl.split(',')[1]), (c) => c.charCodeAt(0));
      const img = await out.embedJpg(jpegBytes);
      const pdfPage = out.addPage([canvas.width, canvas.height]);
      pdfPage.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
    }
    const bytes = await out.save({ useObjectStreams: true });
    return bytes;
  }

  // Pass 1: binary-search JPEG quality at a fixed, print-quality DPI scale.
  let scale = 1.4; // ≈ 135 DPI equivalent off a 96-DPI CSS page, sharp enough for text
  let lo = 0.15, hi = 0.95, best = null, bestUnderSize = -1;
  for (let i = 0; i < 8; i++) {
    const q = (lo + hi) / 2;
    onProg(20 + Math.round((i / 8) * 55), `Compressing… pass ${i + 1}`);
    const bytes = await buildAt(scale, q);
    if (bytes.length <= maxBytes) {
      if (bytes.length > bestUnderSize) { bestUnderSize = bytes.length; best = bytes; }
      lo = q;
    } else {
      hi = q;
    }
  }

  // Pass 2: if quality alone can't get under maxBytes even at the floor,
  // or we're still far under minBytes (unusual), step DPI down too.
  if (!best) {
    onProg(80, 'Reducing resolution…');
    for (const s of [1.1, 0.85, 0.65, 0.5]) {
      const bytes = await buildAt(s, 0.6);
      if (bytes.length <= maxBytes) { best = bytes; break; }
    }
  }
  if (!best) {
    // Last resort: smallest/lowest-quality pass, whatever size it is.
    best = await buildAt(0.5, 0.35);
  }

  onProg(98, 'Finalizing…');
  const blob = new Blob([best], { type: 'application/pdf' });
  return { blob, finalSize: blob.size };
}
