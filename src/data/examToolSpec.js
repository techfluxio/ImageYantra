import { EXAMS } from './exams.js';
import { EXAM_TOOL_BASE } from './examToolBase.js';
import { parseDimsSpec, parseSizeSpec } from '../utils/imageProcessing.js';

/** Sensible NTA-style defaults for exams that don't have a dedicated entry in exams.js. */
const DEFAULT_BY_KIND = {
  photo: { dims: '3.5 × 4.5 cm', size: '10 – 200 KB', format: 'JPG / JPEG', bg: 'White', note: '80% face coverage, ears visible, plain white background.' },
  signature: { dims: '4.5 × 2.0 cm', size: '4 – 30 KB', format: 'JPG / JPEG', note: 'Signed in black or blue ink on plain white paper.' },
  thumb: { dims: '3 × 3 cm', size: '20 – 100 KB', format: 'JPG / JPEG', note: 'Left thumb impression on plain white paper.' },
  documents: { format: 'PDF', maxSize: '50 – 300 KB', note: 'Category / PwD / supporting certificate.' },
};

/** icon → which field of an exams.js entry (or DEFAULT_BY_KIND) to read */
const KIND_BY_ICON = {
  photo: 'photo',
  signature: 'signature',
  thumb: 'thumb',
  documents: 'documents',
};

function fieldForKind(exam, kind) {
  if (!exam) return null;
  if (kind === 'photo') return exam.photo;
  if (kind === 'signature') return exam.signature;
  if (kind === 'thumb') return exam.thumb;
  if (kind === 'documents') return exam.document;
  return null;
}

/**
 * Resolves a concrete spec for a tool from `examTools.js`.
 * @param {{slug:string, icon:string, name:string}} tool
 * @returns {{
 *   kind: 'photo'|'signature'|'thumb'|'documents',
 *   examName: string|null,
 *   dimsLabel: string|null,
 *   sizeLabel: string|null,
 *   dims: {w:number,h:number}|null,
 *   sizeRange: {minBytes:number,maxBytes:number}|null,
 *   bg: string|null,
 *   format: string,
 *   note: string|null,
 * }}
 */
export function getExamToolSpec(tool) {
  const kind = KIND_BY_ICON[tool.icon] || 'photo';
  const baseSlug = EXAM_TOOL_BASE[tool.slug];
  const exam = baseSlug ? EXAMS.find((e) => e.slug === baseSlug) : null;
  const raw = fieldForKind(exam, kind) || DEFAULT_BY_KIND[kind] || DEFAULT_BY_KIND.photo;

  const defaults = DEFAULT_BY_KIND[kind] || DEFAULT_BY_KIND.photo;
  const dimsLabel = raw.dims || defaults.dims || null;
  const sizeLabel = raw.size || raw.maxSize || defaults.size || defaults.maxSize || null;

  return {
    kind,
    examName: exam?.name || null,
    dimsLabel,
    sizeLabel,
    dims: dimsLabel ? parseDimsSpec(dimsLabel) : null,
    sizeRange: sizeLabel ? parseSizeSpec(sizeLabel) : null,
    bg: raw.bg || defaults.bg || (kind === 'photo' ? 'White' : null),
    format: raw.format || defaults.format || 'JPG / JPEG',
    note: raw.note || defaults.note || null,
  };
}
