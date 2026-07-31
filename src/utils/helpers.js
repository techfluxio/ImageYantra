import { EXAMS } from '../data/exams.js';
import { EXAM_GROUPS } from '../data/examGroups.js';
import { IMAGE_TOOLS } from '../data/imageTools.js';
import { PDF_TOOLS } from '../data/pdfTools.js';
import { GOVT_TOOLS } from '../data/index.js';
import { SOCIAL_TOOLS } from '../data/socialTools.js';
import { OTHER_TOOLS } from '../data/otherTools.js';
import { EXAM_TOOLS } from '../data/examTools.js';

/** Format bytes to human-readable KB / MB */
export function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Clamp a number between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Debounce a function */
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ════════════════════════════════════════════════════════
   EXAM DOCUMENT TOOL TYPES
   Canonical tool types offered per-exam. Every exam's
   `tools` array (plain strings) is matched against these
   keyword lists to generate dedicated SEO landing pages at
   /exam-tools/:examSlug/:toolTypeSlug — fully data-driven.
════════════════════════════════════════════════════════ */
export const EXAM_TOOL_TYPES = [
  {
    slug: 'photo-resizer',
    keywords: ['photo', 'photograph'],
    label: 'Photo Resizer',
    shortLabel: 'Photo',
    icon: 'passport',
    accept: 'image/*',
    actionVerb: 'resize and compress your photograph',
    specKey: 'photo',
  },
  {
    slug: 'signature-resizer',
    keywords: ['signature'],
    label: 'Signature Resizer',
    shortLabel: 'Signature',
    icon: 'signature',
    accept: 'image/*',
    actionVerb: 'resize and compress your signature scan',
    specKey: 'signature',
  },
  {
    slug: 'thumb-impression-resizer',
    keywords: ['thumb'],
    label: 'Thumb Impression Resizer',
    shortLabel: 'Thumb Impression',
    icon: 'thumbprint',
    accept: 'image/*',
    actionVerb: 'prepare your left-hand thumb impression scan',
    specKey: null,
  },
  {
    slug: 'document-resizer',
    keywords: ['document', 'pdf'],
    label: 'Document / PDF Resizer',
    shortLabel: 'Document',
    icon: 'doccheck',
    accept: '.pdf',
    actionVerb: 'compress your certificate or supporting document',
    specKey: 'document',
  },
  {
    slug: 'declaration-resizer',
    keywords: ['declaration', 'handwritten'],
    label: 'Handwritten Declaration Resizer',
    shortLabel: 'Declaration',
    icon: 'signature',
    accept: 'image/*',
    actionVerb: 'prepare your handwritten declaration scan',
    specKey: null,
  },
];

/** Resolve which EXAM_TOOL_TYPES apply to a given exam, in order */
export function getExamToolTypesFor(exam) {
  if (!exam?.tools?.length) return [];
  const resolved = [];
  const seen = new Set();
  exam.tools.forEach((toolName) => {
    const lower = toolName.toLowerCase();
    const match = EXAM_TOOL_TYPES.find((tt) => tt.keywords.some((k) => lower.includes(k)));
    if (match && !seen.has(match.slug)) {
      seen.add(match.slug);
      resolved.push(match);
    }
  });
  return resolved;
}

/** Find a specific exam-tool-type combination, used by the dedicated SEO page */
export function getExamToolType(exam, toolTypeSlug) {
  return getExamToolTypesFor(exam).find((tt) => tt.slug === toolTypeSlug) || null;
}

/* ════════════════════════════════════════════════════════
   LOOKUPS
════════════════════════════════════════════════════════ */

/** Find an exam group by ID */
export function getExamGroup(authorityId) {
  return EXAM_GROUPS.find((g) => g.id === authorityId) || EXAM_GROUPS[0];
}

/** Find an exam by slug */
export function getExamBySlug(slug) {
  return EXAMS.find((e) => e.slug === slug) || null;
}

/** Get all exams for a given authority */
export function getExamsByAuthority(authorityId) {
  return EXAMS.filter((e) => e.authorityId === authorityId);
}

/** Find a tool (from any category) by slug */
export function getToolBySlug(slug) {
  return (
    IMAGE_TOOLS.find((t) => t.slug === slug)  ||
    PDF_TOOLS.find((t) => t.slug === slug)    ||
    GOVT_TOOLS.find((t) => t.slug === slug)   ||
    SOCIAL_TOOLS.find((t) => t.slug === slug) ||
    OTHER_TOOLS.find((t) => t.slug === slug)  ||
    null
  );
}

/* ════════════════════════════════════════════════════════
   SMART SEARCH
   Recognises exam keywords (JEE, NEET, GATE, SSC, UPSC,
   Railway, CUET, IBPS, authority names, etc.) and returns
   grouped, organised suggestions: matched exams, the exact
   document tools for the top exam match, and matched
   general tools.
════════════════════════════════════════════════════════ */

/** Build the flat list of everything searchable, with extra matchable text per exam */
function getSearchableExams() {
  return EXAMS.map((e) => {
    const group = getExamGroup(e.authorityId);
    return {
      ...e,
      _type: 'exam',
      _path: `/exam-tools/${e.slug}`,
      _matchText: [e.name, e.desc, e.authority, e.authorityId, group?.fullName, group?.label]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    };
  });
}

function getSearchableTools() {
  return [
    ...IMAGE_TOOLS.map((t) => ({ ...t, _type: 'tool', _path: `/tools/${t.slug}` })),
    ...PDF_TOOLS.map((t) => ({ ...t, _type: 'tool', _path: `/tools/${t.slug}` })),
    ...GOVT_TOOLS.map((t) => ({ ...t, _type: 'tool', _path: `/tools/${t.slug}` })),
    ...SOCIAL_TOOLS.map((t) => ({ ...t, _type: 'tool', _path: `/tools/${t.slug}` })),
    ...OTHER_TOOLS.map((t) => ({ ...t, _type: 'tool', _path: `/tools/${t.slug}` })),
  ];
}

/** All searchable items (tools + exams) — flat, used for simple lookups */
export function getAllSearchable() {
  return [...getSearchableTools(), ...getSearchableExams()];
}

/**
 * searchItems — intelligent, grouped search.
 * Returns { exams, examTools, tools } so the UI can render
 * organised sections instead of one flat list.
 *
 *  - exams:     matching exam landing pages (max 4)
 *  - examTools: dedicated document-tool pages for the top
 *               1–2 matching exams (Photo Resizer, Signature
 *               Resizer, Thumb Impression Resizer, Document
 *               Resizer …) — max 6
 *  - tools:     matching general Image/PDF/Govt tools (max 5)
 */
export function searchItems(query, limit = 8) {
  const empty = { exams: [], examTools: [], tools: [], total: 0 };
  if (!query || query.trim().length < 2) return empty;
  const q = query.trim().toLowerCase();

  // Split into individual words so "jee photo" matches "jee" AND "photo" separately
  const words = q.split(/\s+/).filter(Boolean);

  // All tool-type keywords (photo, signature, thumb, document, pdf, etc.)
  const allToolTypeKeywords = EXAM_TOOL_TYPES.flatMap((tt) => tt.keywords);

  // Separate query words into exam words vs tool-type words
  const toolWords = words.filter((w) => allToolTypeKeywords.includes(w));
  const examWords = words.filter((w) => !allToolTypeKeywords.includes(w));

  // Match exams by exam-specific words (e.g. "jee", "neet", "ssc", "upsc")
  const matchedExams = getSearchableExams()
    .filter((e) => {
      if (examWords.length > 0) {
        // Every exam word must appear somewhere in the exam match text
        return examWords.every((w) => e._matchText.includes(w));
      }
      // If only tool-type words typed (e.g. just "photo"), show all exams
      return true;
    })
    .slice(0, 4);

  // Build exam tool suggestions — filter by tool-type words if present
  const examTools = [];
  matchedExams.slice(0, 2).forEach((exam) => {
    const applicableTypes = getExamToolTypesFor(exam).filter((tt) => {
      if (toolWords.length === 0) return true; // no tool word typed, show all
      return toolWords.some((tw) => tt.keywords.includes(tw));
    });

    applicableTypes.forEach((tt) => {
      examTools.push({
        _type: 'examtool',
        _path: `/exam-tools/${exam.slug}/${tt.slug}`,
        slug: `${exam.slug}-${tt.slug}`,
        name: `${exam.name} ${tt.label}`,
        desc: `${tt.actionVerb.charAt(0).toUpperCase() + tt.actionVerb.slice(1)} to ${exam.name} specifications.`,
        icon: tt.icon,
      });
    });
  });

  // Match general tools — any word matches name or desc
  const matchedTools = getSearchableTools()
    .filter((t) => {
      const name = (t.name || '').toLowerCase();
      const desc = (t.desc || '').toLowerCase();
      return words.some((w) => name.includes(w) || desc.includes(w));
    })
    .slice(0, 5);

  return {
    exams: matchedExams,
    examTools: examTools.slice(0, 6),
    tools: matchedTools,
    total: matchedExams.length + examTools.length + matchedTools.length,
  };
}

/* ════════════════════════════════════════════════════════
   SEO META BUILDERS
════════════════════════════════════════════════════════ */

/** Build SEO meta for a tool page */
export function buildToolMeta(tool) {
  return {
    title: `${tool.name} — Free Online Tool | ImageYantra`,
    description: `${tool.desc} Free, browser-based, no signup required.`,
    canonical: `https://imageyantra.in/tools/${tool.slug}/`,
  };
}

/** Build SEO meta for a generic exam landing page */
export function buildExamMeta(exam) {
  return {
    title: `${exam.name} Photo & Document Tools — Resize Online | ImageYantra`,
    description: `Prepare ${exam.name} photos, signatures and documents to official specifications. Free, instant, no signup required.`,
    canonical: `https://imageyantra.in/exam-tools/${exam.slug}/`,
  };
}

/** Build SEO meta for a dedicated exam + tool-type landing page (e.g. "JEE Photo Resizer") */
export function buildExamToolMeta(exam, toolType) {
  const examName = exam.name;
  const toolLabel = toolType.label;
  return {
    title: `${examName} ${toolLabel} — ${examName} ${toolType.shortLabel} Resize Online | ImageYantra`,
    description: `Free online ${examName} ${toolLabel.toLowerCase()}. Instantly ${toolType.actionVerb} to exact ${examName} specifications — no signup, no upload to a server.`,
    canonical: `https://imageyantra.in/exam-tools/${exam.slug}/${toolType.slug}/`,
    h1: `${examName} ${toolLabel}`,
  };
}

/** Category label background colour class by blog category */
export function blogCategoryClass(cat) {
  const map = {
    Image:  'badge--accent',
    PDF:    'badge--red',
    Exam:   'badge--green',
    Social: 'badge--amber',
    Govt:   'badge--blue',
    Other:  'badge--neutral',
  };
  return map[cat] || 'badge--accent';
}

/* ════════════════════════════════════════════════════════
   TOOL CATEGORY TONES
   Same purple/red/green/blue/yellow/black palette used by
   data/index.js CATEGORIES[].color, exposed as Tailwind
   classes so any "Related Tools" icon (on any result page)
   can be coloured to match the category it links into,
   instead of defaulting to a single hardcoded colour.
════════════════════════════════════════════════════════ */
export const TOOL_TONE = {
  image: { iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  ring: 'hover:border-violet-200',  headerBg: 'bg-violet-100',  headerText: 'text-violet-600' },
  pdf:   { iconBg: 'bg-red-100',     iconText: 'text-red-500',     ring: 'hover:border-red-200',     headerBg: 'bg-red-100',     headerText: 'text-red-500' },
  exam:  { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', ring: 'hover:border-emerald-200', headerBg: 'bg-emerald-100', headerText: 'text-emerald-600' },
  govt:  { iconBg: 'bg-blue-100',    iconText: 'text-blue-500',    ring: 'hover:border-blue-200',    headerBg: 'bg-blue-100',    headerText: 'text-blue-500' },
  social:{ iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   ring: 'hover:border-amber-200',   headerBg: 'bg-amber-100',   headerText: 'text-amber-600' },
  other: { iconBg: 'bg-neutral-200', iconText: 'text-neutral-800', ring: 'hover:border-neutral-300', headerBg: 'bg-neutral-200', headerText: 'text-neutral-800' },
};

/** Resolve the Tailwind tone classes for a tool category key ('image'|'pdf'|'exam'|'govt'|'social'|'other') */
export function getToolTone(source) {
  return TOOL_TONE[source] || TOOL_TONE.image;
}

/* ════════════════════════════════════════════════════════
   RELATED TOOLS — exam & social
   Used by ExamToolPage / SocialToolPage result screens to
   populate a sensible, on-category "Related Tools" strip
   without hand-maintaining a list per exam or per platform.
════════════════════════════════════════════════════════ */

const EXAM_TYPE_SUFFIX = /-(photo|signature|documents|thumb-impression|declaration)$/;

/** "jee-photo" → "jee", "rrb-ntpc-ug-signature" → "rrb-ntpc-ug" */
function examToolPrefix(slug) {
  return slug.replace(EXAM_TYPE_SUFFIX, '');
}

/**
 * Related exam tools for a given exam tool: other document types for the
 * *same* exam first (e.g. JEE Photo → JEE Signature, JEE Documents), then
 * tools from other exams under the same authority, up to `limit`.
 */
export function getRelatedExamTools(tool, limit = 4) {
  if (!tool) return [];
  const prefix = examToolPrefix(tool.slug);
  const sameExam = EXAM_TOOLS.filter((t) => t.slug !== tool.slug && examToolPrefix(t.slug) === prefix);
  const sameAuthority = EXAM_TOOLS.filter(
    (t) => t.slug !== tool.slug && examToolPrefix(t.slug) !== prefix &&
      t.authorities?.some((a) => tool.authorities?.includes(a)),
  );
  const seen = new Set([tool.slug]);
  const result = [];
  for (const t of [...sameExam, ...sameAuthority]) {
    if (seen.has(t.slug)) continue;
    seen.add(t.slug);
    result.push(t);
    if (result.length >= limit) break;
  }
  return result;
}

/**
 * Related social-platform resize tools for a given social tool — the next
 * few platforms in the catalog after the current one (wraps around), so
 * every tool page shows a varied, non-repeating set of siblings.
 */
export function getRelatedSocialTools(tool, limit = 4) {
  if (!tool) return [];
  const idx = SOCIAL_TOOLS.findIndex((t) => t.slug === tool.slug);
  const ordered = idx === -1
    ? SOCIAL_TOOLS
    : [...SOCIAL_TOOLS.slice(idx + 1), ...SOCIAL_TOOLS.slice(0, idx)];
  return ordered.filter((t) => t.slug !== tool.slug).slice(0, limit);
}