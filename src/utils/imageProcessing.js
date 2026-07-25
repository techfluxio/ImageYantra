/**
 * imageProcessing.js
 * ────────────────────────────────────────────────────────────────
 * Canvas-based image processing engine, ported 1:1 from the
 * original imageyantra-main vanilla-JS tools (js/utils.js +
 * inline <script> logic in tools/compress, tools/resize,
 * tools/crop, tools/rotate-flip, tools/resolution).
 *
 * Everything here runs entirely in the browser — no upload,
 * no server round-trip.
 */

/* ── Basic file/image helpers (from js/utils.js) ─────────── */

export function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export function dataURLSize(dataUrl) {
  const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
  return Math.round((base64.length * 3) / 4);
}

/** Plain, no-dialog download — used only as a last-resort fallback. */
function fallbackAnchorDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Save a file, letting the user pick the destination folder and rename it,
 * via the native File System Access API ("Save As" dialog). Falls back to a
 * normal browser download (to the default Downloads folder) only in browsers
 * that don't support the API (e.g. Firefox, Safari).
 *
 * @param {string} dataUrl
 * @param {string} filename  suggested file name (user can change it in the dialog)
 * @returns {Promise<'saved'|'cancelled'|'fallback'>}
 */
export async function downloadDataURL(dataUrl, filename) {
  if (typeof window !== 'undefined' && window.showSaveFilePicker) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const dotIdx = filename.lastIndexOf('.');
      const ext = dotIdx > -1 ? filename.slice(dotIdx) : '';
      const mime = blob.type || 'application/octet-stream';
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'File', accept: { [mime]: ext ? [ext] : [] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return 'saved';
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
      // fall through to normal download on any other error
    }
  }
  fallbackAnchorDownload(dataUrl, filename);
  return 'fallback';
}

/** Human-readable byte size, shared by every result/summary/info panel. */
export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Best-effort human label for a File's image format (JPG, PNG, WEBP, HEIC…). */
export function fileFormatLabel(file) {
  if (!file) return '—';
  const mime = file.type;
  if (mime && mime.includes('/')) {
    const m = mime.split('/')[1].toUpperCase().replace('JPEG', 'JPG').split('+')[0];
    if (m && m !== 'OCTET-STREAM') return m;
  }
  const ext = file.name?.split('.').pop();
  return ext ? ext.toUpperCase().replace('JPEG', 'JPG') : '—';
}

/**
 * Re-encode a full-resolution image into another format. Used by every
 * simple "X to Y" converter tool (JPG⇄PNG, WEBP⇄JPG, etc).
 * @param {string} dataUrl
 * @param {'jpeg'|'png'|'webp'} format
 * @param {number} quality  0–1, ignored for png
 */
export async function convertImageFormat(dataUrl, format, quality = 0.92) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const img = await loadImage(dataUrl);
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  if (format === 'jpeg') {
    // JPEG has no alpha channel — paint white first so a transparent PNG
    // doesn't come out with a black background.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  return canvas.toDataURL(mime, quality);
}

function tick(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

/* Shared offscreen canvas (created lazily, reused across calls) */
let _canvas = null;
function getCanvas() {
  if (!_canvas) _canvas = document.createElement('canvas');
  return _canvas;
}

/* ════════════════════════════════════════════════════════════
   COMPRESS — binary-search on JPEG quality + dimension scaling
   until the output is as close as possible to a target byte size.
   Ported from tools/compress/index.html
════════════════════════════════════════════════════════════ */

/**
 * @param {{dataUrl:string, origBytes:number}} state
 * @param {number} targetBytes  hard ceiling — the result will never exceed this
 * @param {(pct:number, msg:string) => void} onProg
 * @param {{minBytes?: number}} [opts]  optional soft floor (e.g. for a fixed
 *   "under 10KB" tool you might pass targetBytes=9.5KB, minBytes=9KB so the
 *   output lands inside that exact band instead of just "close to 10KB")
 */
export async function compressToTarget(state, targetBytes, onProg = () => {}, opts = {}) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');

  onProg(10, 'Loading image…');
  const srcImg = await loadImage(state.dataUrl);
  const ratio = targetBytes / state.origBytes;
  let bestDataUrl = null;

  if (ratio <= 1.05) {
    onProg(18, 'Optimizing quality…');
    canvas.width = srcImg.naturalWidth;
    canvas.height = srcImg.naturalHeight;
    ctx.drawImage(srcImg, 0, 0);

    // Track the LARGEST size that is still <= targetBytes (never the
    // closest-by-absolute-difference, which could overshoot the limit).
    let lo = 0.01, hi = 1.0;
    let bestUnderSize = -1;
    let smallestOverall = null, smallestOverallSize = Infinity;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      const dUrl = canvas.toDataURL('image/jpeg', mid);
      const sz = dataURLSize(dUrl);
      if (sz < smallestOverallSize) { smallestOverallSize = sz; smallestOverall = dUrl; }
      if (sz <= targetBytes) {
        if (sz > bestUnderSize) { bestUnderSize = sz; bestDataUrl = dUrl; }
        lo = mid;
      } else {
        hi = mid;
      }
      onProg(18 + Math.round((i / 20) * 42), `Tuning quality… pass ${i + 1}`);
      await tick(0);
    }

    if (!bestDataUrl) {
      // Even minimum JPEG quality at full size is still over target —
      // dimensions must be reduced too. smallestOverall is our best fallback.
      bestDataUrl = smallestOverall;
    }

    if (dataURLSize(bestDataUrl) > targetBytes * 1.02 || !bestDataUrl) {
      onProg(62, 'Scaling dimensions…');
      const scaled = await scaleDimSearch(srcImg, targetBytes, onProg, 62, 92);
      if (scaled) bestDataUrl = scaled;
    }

    // Optional soft floor: if we're allowed to land higher within the band
    // and quality-search undershot it, nudge quality back up (still capped).
    if (opts.minBytes && dataURLSize(bestDataUrl) < opts.minBytes) {
      const nudged = await nudgeUpToBand(canvas, ctx, srcImg, targetBytes, opts.minBytes, bestDataUrl);
      if (nudged) bestDataUrl = nudged;
    }
  } else {
    onProg(18, 'Upscaling…');
    bestDataUrl = await enlargeSearch(srcImg, targetBytes, onProg);
  }

  // Final hard-cap safety net: guarantee we never hand back something over
  // the limit, no matter which branch produced it.
  if (dataURLSize(bestDataUrl) > targetBytes) {
    const shrunk = await scaleDimSearch(srcImg, targetBytes, onProg, 92, 98);
    if (shrunk && dataURLSize(shrunk) <= targetBytes) bestDataUrl = shrunk;
  }

  return { dataUrl: bestDataUrl, finalSize: dataURLSize(bestDataUrl), origSize: state.origBytes };
}

/** After hitting a size below the desired band floor, try nudging quality
 * back up in small steps without ever crossing targetBytes. */
async function nudgeUpToBand(canvas, ctx, srcImg, targetBytes, minBytes, current) {
  canvas.width = srcImg.naturalWidth;
  canvas.height = srcImg.naturalHeight;
  ctx.drawImage(srcImg, 0, 0);
  let best = current;
  for (let q = 1; q <= 40; q++) {
    const quality = q / 40;
    const dUrl = canvas.toDataURL('image/jpeg', quality);
    const sz = dataURLSize(dUrl);
    if (sz <= targetBytes && sz > dataURLSize(best)) best = dUrl;
    if (sz >= minBytes && sz <= targetBytes) return dUrl;
    if (sz > targetBytes) break;
    await tick(0);
  }
  return best;
}

async function scaleDimSearch(srcImg, targetBytes, onProg, pStart, pEnd) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const origW = srcImg.naturalWidth, origH = srcImg.naturalHeight;
  let lo = 0.05, hi = 1.0, best = null, bestSize = -1;
  for (let i = 0; i < 14; i++) {
    const scale = (lo + hi) / 2;
    const w = Math.max(1, Math.round(origW * scale));
    const h = Math.max(1, Math.round(origH * scale));
    canvas.width = w; canvas.height = h;
    ctx.drawImage(srcImg, 0, 0, w, h);
    let qLo = 0.01, qHi = 1.0, qBest = '', qBestSize = -1;
    for (let q = 0; q < 8; q++) {
      const qm = (qLo + qHi) / 2;
      const dUrl = canvas.toDataURL('image/jpeg', qm);
      const sz = dataURLSize(dUrl);
      if (sz <= targetBytes && sz > qBestSize) { qBestSize = sz; qBest = dUrl; }
      if (sz <= targetBytes) qLo = qm; else qHi = qm;
    }
    // If even quality 0.01 at this scale is over target, qBest stays '' —
    // treat as "too big", push scale down further.
    const sSz = qBestSize;
    if (sSz > bestSize) { bestSize = sSz; best = qBest; }
    if (sSz > 0) lo = scale; else hi = scale;
    onProg(pStart + Math.round((i / 14) * (pEnd - pStart)), `Scaling… pass ${i + 1}`);
    await tick(0);
  }
  return best || null;
}

async function enlargeSearch(srcImg, targetBytes, onProg) {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const origW = srcImg.naturalWidth, origH = srcImg.naturalHeight;
  let lo = 1.0, hi = 4, best = null, bestDiff = Infinity;
  canvas.width = origW; canvas.height = origH;
  ctx.drawImage(srcImg, 0, 0);
  const baseSize = dataURLSize(canvas.toDataURL('image/jpeg', 0.98));
  const estScale = Math.min(4, Math.sqrt(targetBytes / Math.max(baseSize, 1)));
  hi = Math.max(1.02, estScale * 1.1);
  for (let i = 0; i < 16; i++) {
    const scale = (lo + hi) / 2;
    const w = Math.round(origW * scale), h = Math.round(origH * scale);
    canvas.width = w; canvas.height = h;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(srcImg, 0, 0, w, h);
    const dUrl = canvas.toDataURL('image/jpeg', 0.98);
    const sz = dataURLSize(dUrl);
    const diff = Math.abs(sz - targetBytes);
    if (diff < bestDiff) { bestDiff = diff; best = dUrl; }
    if (sz < targetBytes) lo = scale; else hi = scale;
    onProg(18 + Math.round((i / 16) * 72), `Upscaling… pass ${i + 1}`);
    await tick(0);
  }
  return best;
}

/* Presets + default target, ported from tools/compress/index.html */
export function buildCompressPresets(bytes) {
  const mb = bytes / (1024 * 1024), kb = bytes / 1024;
  const presets = [];
  if (mb >= 1) {
    if (mb >= 5) presets.push({ label: '4MB', bytes: 4 * 1024 * 1024, num: 4, unit: 'mb' });
    if (mb >= 3) presets.push({ label: '2MB', bytes: 2 * 1024 * 1024, num: 2, unit: 'mb' });
    presets.push({ label: '1MB', bytes: 1 * 1024 * 1024, num: 1, unit: 'mb' });
    presets.push({ label: '500KB', bytes: 500 * 1024, num: 500, unit: 'kb' });
    presets.push({ label: '200KB', bytes: 200 * 1024, num: 200, unit: 'kb' });
    presets.push({ label: '100KB', bytes: 100 * 1024, num: 100, unit: 'kb' });
  } else if (kb >= 200) {
    presets.push({ label: '500KB', bytes: 500 * 1024, num: 500, unit: 'kb' });
    presets.push({ label: '200KB', bytes: 200 * 1024, num: 200, unit: 'kb' });
    presets.push({ label: '100KB', bytes: 100 * 1024, num: 100, unit: 'kb' });
    presets.push({ label: '50KB', bytes: 50 * 1024, num: 50, unit: 'kb' });
  } else if (kb >= 50) {
    presets.push({ label: '200KB', bytes: 200 * 1024, num: 200, unit: 'kb' });
    presets.push({ label: '100KB', bytes: 100 * 1024, num: 100, unit: 'kb' });
    presets.push({ label: '50KB', bytes: 50 * 1024, num: 50, unit: 'kb' });
    presets.push({ label: '20KB', bytes: 20 * 1024, num: 20, unit: 'kb' });
    presets.push({ label: '10KB', bytes: 10 * 1024, num: 10, unit: 'kb' });
  } else {
    presets.push({ label: '50KB', bytes: 50 * 1024, num: 50, unit: 'kb' });
    presets.push({ label: '20KB', bytes: 20 * 1024, num: 20, unit: 'kb' });
    presets.push({ label: '10KB', bytes: 10 * 1024, num: 10, unit: 'kb' });
    presets.push({ label: '5KB', bytes: 5 * 1024, num: 5, unit: 'kb' });
  }
  return presets;
}

export function defaultCompressTarget(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 2) return { num: 1, unit: 'mb' };
  if (mb >= 0.5) return { num: 300, unit: 'kb' };
  const kb = bytes / 1024;
  if (kb >= 100) return { num: 50, unit: 'kb' };
  return { num: Math.max(10, Math.round(kb * 0.5)), unit: 'kb' };
}

/** Returns a warning message string, or null if no warning is needed */
export function compressWarning(origBytes, targetBytes) {
  if (!targetBytes) return null;
  const ratio = targetBytes / origBytes;
  if (origBytes < 200 * 1024 && targetBytes > 5 * 1024 * 1024) {
    return 'Large size increase may slightly reduce quality.';
  }
  if (ratio > 10) {
    return `Target is ${Math.round(ratio)}× the original — significant quality loss is likely.`;
  }
  if (ratio > 2) {
    return 'Target is larger than the original. The tool will upscale dimensions to get as close as possible.';
  }
  return null;
}

/* ════════════════════════════════════════════════════════════
   RESIZE / RESOLUTION — redraw to exact pixel dimensions.
   Ported from tools/resize + tools/resolution.
════════════════════════════════════════════════════════════ */

/**
 * @param {string} dataUrl
 * @param {number} w
 * @param {number} h
 * @param {{format?: 'jpeg'|'png'|'webp', smooth?: boolean, quality?: number}} opts
 */
export async function resizeImage(dataUrl, w, h, opts = {}) {
  const { format = 'jpeg', smooth = true, quality = 0.92 } = opts;
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const img = await loadImage(dataUrl);
  ctx.imageSmoothingEnabled = smooth;
  ctx.imageSmoothingQuality = 'high';
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  return canvas.toDataURL(mime, quality);
}

/* ════════════════════════════════════════════════════════════
   CROP — crop a region (in natural-pixel coordinates) out of
   the source image. Ported from tools/crop.
════════════════════════════════════════════════════════════ */

/**
 * @param {string} dataUrl
 * @param {{x:number,y:number,w:number,h:number}} region  natural-px coords
 * @param {{format?: 'jpeg'|'png'|'webp', quality?: number}} opts
 */
export async function cropImage(dataUrl, region, opts = {}) {
  const { format = 'jpeg', quality = 0.92 } = opts;
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const img = await loadImage(dataUrl);
  const w = Math.max(1, Math.round(region.w));
  const h = Math.max(1, Math.round(region.h));
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, region.x, region.y, region.w, region.h, 0, 0, w, h);
  const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  return canvas.toDataURL(mime, quality);
}

/* ════════════════════════════════════════════════════════════
   EXAM TOOLS — resize to an exact pixel box + fit within a KB
   range, per official exam specifications (photo/signature/
   thumb/document). New functionality — imageyantra-main had
   no equivalent tool, so this is a fresh, from-scratch engine
   rather than a port.
════════════════════════════════════════════════════════════ */

/** Parse a dimension spec like "3.5 × 4.5 cm" or "200 × 200 px" into pixels. */
export function parseDimsSpec(str) {
  if (!str) return null;
  const m = str.match(/([\d.]+)\s*[×x]\s*([\d.]+)\s*(cm|mm|px|in)?/i);
  if (!m) return null;
  const w = parseFloat(m[1]);
  const h = parseFloat(m[2]);
  const unit = (m[3] || 'px').toLowerCase();
  const DPI = 300; // standard print resolution used for cm/mm/in → px conversion
  if (unit === 'cm') return { w: Math.round((w / 2.54) * DPI), h: Math.round((h / 2.54) * DPI) };
  if (unit === 'mm') return { w: Math.round((w / 25.4) * DPI), h: Math.round((h / 25.4) * DPI) };
  if (unit === 'in') return { w: Math.round(w * DPI), h: Math.round(h * DPI) };
  return { w: Math.round(w), h: Math.round(h) };
}

/** Parse a size spec like "10 – 200 KB", "4-30KB", or "500 KB" into a byte range. */
export function parseSizeSpec(str) {
  if (!str) return null;
  // Matches "10 – 200 KB" (unit stated once, at the end) as well as
  // "5–200 KB / 5–150 KB" (unit stated on every number).
  const nums = [...str.matchAll(/([\d.]+)\s*(KB|MB)?(?=\s|[-–—/]|$)/gi)].filter((m) => m[1] !== '');
  if (!nums.length) return null;
  const toBytes = (n, u) => (u && u.toUpperCase() === 'MB' ? n * 1024 * 1024 : n * 1024);

  if (nums.length === 1) {
    return { minBytes: 0, maxBytes: toBytes(parseFloat(nums[0][1]), nums[0][2]) };
  }

  // Numbers without their own unit inherit the nearest unit that follows them.
  let lastUnit = null;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i][2]) lastUnit = nums[i][2];
    else if (lastUnit) nums[i][2] = lastUnit;
  }

  const first = nums[0];
  const last = nums[nums.length - 1];
  return {
    minBytes: toBytes(parseFloat(first[1]), first[2] || last[2]),
    maxBytes: toBytes(parseFloat(last[1]), last[2] || first[2]),
  };
}

/**
 * Resize+crop (cover-fit) an image onto an exact pixel canvas, optionally
 * painting a background colour first (so transparent PNGs come out opaque),
 * then binary-search JPEG quality until the result fits maxBytes.
 * Dimensions are never altered further — exam specs require exact px.
 */
export async function examFitImage(dataUrl, { width, height, bgColor, maxBytes, minBytes = 0 }) {
  const img = await loadImage(dataUrl);
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const w = width || img.naturalWidth;
  const h = height || img.naturalHeight;
  canvas.width = w;
  canvas.height = h;

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  // Cover-fit: scale to fill the box, center-cropping the overflow
  const srcRatio = img.naturalWidth / img.naturalHeight;
  const dstRatio = w / h;
  let sx, sy, sw, sh;
  if (srcRatio > dstRatio) {
    sh = img.naturalHeight;
    sw = sh * dstRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / dstRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  let lo = 0.02, hi = 0.97, best = canvas.toDataURL('image/jpeg', 0.97), bestDiff = Infinity;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const dUrl = canvas.toDataURL('image/jpeg', mid);
    const sz = dataURLSize(dUrl);
    const diff = maxBytes ? Math.abs(sz - maxBytes) : 0;
    if (!maxBytes || sz <= maxBytes) {
      if (diff <= bestDiff) { bestDiff = diff; best = dUrl; }
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const finalSize = dataURLSize(best);
  return { dataUrl: best, width: w, height: h, size: finalSize, belowMin: minBytes ? finalSize < minBytes : false };
}

/**
 * Like examFitImage, but "contain" instead of "cover" — the whole source
 * image is scaled down to fit inside the box and padded with bgColor on
 * the sides, rather than cropping any of it away. Used for signatures and
 * thumb impressions, where cropping could cut off part of the mark.
 */
export async function examFitImageContain(dataUrl, { width, height, bgColor = '#ffffff', maxBytes, minBytes = 0 }) {
  const img = await loadImage(dataUrl);
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const w = width || img.naturalWidth;
  const h = height || img.naturalHeight;
  canvas.width = w;
  canvas.height = h;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const srcRatio = img.naturalWidth / img.naturalHeight;
  const dstRatio = w / h;
  let dw, dh;
  if (srcRatio > dstRatio) {
    dw = w;
    dh = w / srcRatio;
  } else {
    dh = h;
    dw = h * srcRatio;
  }
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);

  let lo = 0.02, hi = 0.97, best = canvas.toDataURL('image/jpeg', 0.97), bestDiff = Infinity;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const dUrl = canvas.toDataURL('image/jpeg', mid);
    const sz = dataURLSize(dUrl);
    const diff = maxBytes ? Math.abs(sz - maxBytes) : 0;
    if (!maxBytes || sz <= maxBytes) {
      if (diff <= bestDiff) { bestDiff = diff; best = dUrl; }
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const finalSize = dataURLSize(best);
  return { dataUrl: best, width: w, height: h, size: finalSize, belowMin: minBytes ? finalSize < minBytes : false };
}

/* ════════════════════════════════════════════════════════════
   ROTATE / FLIP — pixel-level rotate (any angle) + mirror.
   Ported from tools/rotate-flip.
════════════════════════════════════════════════════════════ */

/**
 * @param {string} dataUrl
 * @param {{angle?:number, flipH?:boolean, flipV?:boolean, expand?:boolean, format?:string, quality?:number}} opts
 */
export async function rotateFlipImage(dataUrl, opts = {}) {
  const { angle = 0, flipH = false, flipV = false, expand = true, format = 'jpeg', quality = 0.92 } = opts;
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const img = await loadImage(dataUrl);
  const rad = (angle * Math.PI) / 180;
  let w, h;
  if (expand) {
    const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    w = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
    h = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
  } else {
    w = img.naturalWidth;
    h = img.naturalHeight;
  }
  canvas.width = w;
  canvas.height = h;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
  const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  return { dataUrl: canvas.toDataURL(mime, quality), width: w, height: h };
}
