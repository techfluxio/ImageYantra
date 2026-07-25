/**
 * EXAM_TOOL_BASE
 * ────────────────────────────────────────────────────────────
 * Maps each entry in `examTools.js` to the exam (from `exams.js`)
 * whose official photo / signature / thumb / document spec it
 * should follow. Tools for exams that don't have a dedicated
 * entry in `exams.js` map to `null` and fall back to the generic
 * NTA-style defaults in `examToolSpec.js`.
 */
export const EXAM_TOOL_BASE = {
  'jee-photo': 'jee-main',
  'jee-signature': 'jee-main',
  'jee-documents': 'jee-main',

  'neet-photo': 'neet-ug',
  'neet-signature': 'neet-ug',
  'neet-thumb-impression': 'neet-ug',
  'neet-documents': 'neet-ug',

  'cuet-ug-photo': 'cuet-ug',
  'cuet-pg-photo': 'cuet-ug',

  'gate-photo': 'gate',
  'gate-signature': 'gate',

  'iit-jam-photo': 'iit-jam',

  'bitsat-photo': null,
  'viteee-photo': null,
  'comedk-photo': null,
  'wbjee-photo': null,
  'mht-cet-photo': null,
  'kcet-photo': null,

  'ssc-photo': 'ssc-cgl',
  'ssc-signature': 'ssc-cgl',
  'ssc-documents': 'ssc-cgl',
  'ssc-cgl-photo': 'ssc-cgl',
  'ssc-chsl-photo': 'ssc-chsl',
  'ssc-gd-photo': 'ssc-gd',
  'ssc-mts-photo': 'ssc-mts',
  'ssc-cpo-photo': 'ssc-cpo',

  'rrb-ntpc-ug-photo': 'rrb-ntpc',
  'rrb-ntpc-ug-signature': 'rrb-ntpc',
  'rrb-ntpc-graduate-photo': 'rrb-ntpc',
  'rrb-ntpc-graduate-signature': 'rrb-ntpc',
  'rrb-alp-photo': 'rrb-alp',
  'rrb-technician-photo': 'rrb-alp',
  'rrb-je-photo': 'rrb-ntpc',

  'upsc-photo': 'upsc-cse',
  'upsc-signature': 'upsc-cse',
  'nda-photo': 'nda',
  'nda-signature': 'nda',
  'cds-photo': 'cds',

  'afcat-photo': 'afcat',
  'capf-photo': 'afcat',
  'crpf-photo': 'afcat',
  'bsf-photo': 'afcat',
  'cisf-photo': 'afcat',
  'itbp-photo': 'afcat',
  'ssb-photo': 'afcat',

  'ibps-po-photo': 'ibps-po',
  'ibps-clerk-photo': 'ibps-clerk',
  'sbi-po-photo': 'sbi-po',
  'sbi-clerk-photo': 'sbi-clerk',
  'rbi-grade-b-photo': 'rbi-grade-b',
  'nabard-photo': 'rbi-grade-b',

  'ctet-photo': 'ctet',
  'ugc-net-photo': 'ugc-net',
  'csir-net-photo': 'csir-ugc-net',

  'clat-photo': 'clat',
  'ailet-photo': 'ailet',

  'nift-photo': null,
  'nid-photo': null,
  'cat-photo': null,
  'xat-photo': null,
  'cmat-photo': 'cmat',
  'mat-photo': null,
  'snap-photo': null,
  'icai-ca-photo': null,
  'cma-photo': null,
  'cs-executive-photo': null,
};

/** Tools that are free-form (user picks their own target exam/size), not tied to one exam. */
export const FREEFORM_EXAM_TOOL_SLUGS = new Set([
  'exam-photo-resizer',
  'exam-signature-resizer',
  'thumb-impression-resizer',
]);

/** Tools that are pure inspection utilities (no resize/compress engine). */
export const UTILITY_EXAM_TOOL_SLUGS = new Set([
  'check-photo-dimensions',
  'check-file-size',
  'preview-before-upload',
]);
