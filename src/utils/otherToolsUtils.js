/**
 * Small, dependency-free helpers that back the "Other Tools" catalog
 * (QR/barcode generation delegate to the qrcode/jsbarcode packages —
 * everything here is hand-rolled to avoid pulling in extra deps for
 * one-off text/data utilities).
 */

/* ════════════════════════════════════════════════════════
   MD5 — compact, public-domain style implementation.
   Web Crypto's SubtleCrypto intentionally doesn't support MD5,
   so the Hash Generator tool needs its own.
════════════════════════════════════════════════════════ */
export function md5(input) {
  function rotl(x, c) { return (x << c) | (x >>> (32 - c)); }
  function toUtf8Bytes(str) {
    return new TextEncoder().encode(str);
  }

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const K = new Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;

  const bytes = toUtf8Bytes(input);
  const bitLen = bytes.length * 8;
  const withOne = [...bytes, 0x80];
  while (withOne.length % 64 !== 56) withOne.push(0);
  const lenBytes = new Array(8);
  let l = bitLen;
  for (let i = 0; i < 8; i++) { lenBytes[i] = l & 0xff; l = Math.floor(l / 256); }
  const msg = [...withOne, ...lenBytes];

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let chunkStart = 0; chunkStart < msg.length; chunkStart += 64) {
    const M = new Array(16);
    for (let j = 0; j < 16; j++) {
      const o = chunkStart + j * 4;
      M[j] = (msg[o] | (msg[o + 1] << 8) | (msg[o + 2] << 16) | (msg[o + 3] << 24)) >>> 0;
    }
    let [A, B, C, D] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotl(F, s[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }

  function toHexLE(n) {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return hex;
  }
  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}

/** SHA-1 / SHA-256 / SHA-384 / SHA-512 via Web Crypto, hex-encoded. */
export async function subtleHashHex(algo, input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ════════════════════════════════════════════════════════
   Minimal Markdown → HTML renderer.
   Covers headers, bold/italic, links, inline code, code
   fences, blockquotes, hr, ordered/unordered lists and
   paragraphs — enough for a live preview tool without a
   dependency.
════════════════════════════════════════════════════════ */
export function renderMarkdown(src = '') {
  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inCode = false, codeBuf = [];
  let listType = null, listBuf = [];

  const flushList = () => {
    if (!listType) return;
    html.push(`<${listType} class="md-list">${listBuf.join('')}</${listType}>`);
    listType = null; listBuf = [];
  };

  const inline = (text) => {
    let t = escapeHtml(text);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/_([^_]+)_/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return t;
  };

  for (const raw of lines) {
    const line = raw;
    if (/^```/.test(line)) {
      if (inCode) { html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`); codeBuf = []; inCode = false; }
      else { flushList(); inCode = true; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    if (/^\s*$/.test(line)) { flushList(); continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { flushList(); html.push('<hr />'); continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushList(); const lvl = h[1].length; html.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }

    const bq = line.match(/^>\s?(.*)$/);
    if (bq) { flushList(); html.push(`<blockquote>${inline(bq[1])}</blockquote>`); continue; }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ul) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul'; listBuf.push(`<li>${inline(ul[1])}</li>`); continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol'; listBuf.push(`<li>${inline(ol[1])}</li>`); continue;
    }

    flushList();
    html.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  if (inCode && codeBuf.length) html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);

  return html.join('\n');
}

/* ════════════════════════════════════════════════════════
   Small RFC-4180-ish CSV parser (handles quoted fields,
   escaped quotes, and both , and \n / \r\n separators).
════════════════════════════════════════════════════════ */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** Cheap UUID v4 fallback for browsers without crypto.randomUUID */
export function uuidV4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
