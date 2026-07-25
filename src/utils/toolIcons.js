import {
  Image as ImageIcon,
  Minimize2, RefreshCw, Crop, Eraser, Maximize2, RotateCw, FlipHorizontal,
  ListOrdered, FileMinus2, FileImage, Files, FileStack, Scissors, Code2,
  LockOpen, Lock, Users, SquareUser, PenTool, FileText, Fingerprint,
  PenSquare, ScanLine, Ruler, HardDrive, Eye,
  QrCode, Barcode, Palette, Braces, Hash, Link2, Type, ListChecks,
  CaseSensitive, Table, FileCode, Regex, KeyRound, Clock,
} from 'lucide-react';

/**
 * Canonical icon for each tool `icon` key, as used across the data files
 * (imageTools.js, pdfTools.js, examTools.js, etc). This is the single
 * source of truth for tool iconography — Home page, the PDF/Image/Exam
 * tools listing pages, and each tool's own "Related Tools" section on
 * its result page all import from here, so the same tool always shows
 * the same icon everywhere on the site.
 */
export const TOOL_ICONS = {
  compress: Minimize2, convert: RefreshCw, crop: Crop, removebg: Eraser,
  resize: Maximize2, rotate: RotateCw, flip: FlipHorizontal,
  arrange: ListOrdered, compresspdf: FileMinus2, imgpdf: FileImage,
  manage: Files, merge: FileStack, split: Scissors, htmlpdf: Code2,
  unlock: LockOpen, lock: Lock, govt: Users, passport: SquareUser,
  photo: SquareUser, signature: PenTool, documents: FileText, thumb: Fingerprint,
  resizer: Maximize2, sigresizer: PenSquare, thumbresizer: ScanLine,
  dimensions: Ruler, filesize: HardDrive, preview: Eye,
  qr: QrCode, barcode: Barcode, color: Palette, base64: Braces, hash: Hash,
  urlencode: Link2, lorem: Type, wordcount: ListChecks, case: CaseSensitive,
  json: Braces, csv: Table, markdown: FileCode, regex: Regex, uuid: KeyRound,
  timestamp: Clock,
};

/** Returns the lucide icon *component* (not an element) for a tool's icon key. */
export function toolIcon(key) {
  return TOOL_ICONS[key] || ImageIcon;
}

/**
 * Looks up a tool's icon component by slug across one or more tool
 * catalogs (e.g. PDF_TOOLS). Falls back to the generic image icon if
 * the slug isn't found in any of them.
 */
export function iconForSlug(slug, ...catalogs) {
  for (const catalog of catalogs) {
    const match = catalog.find((t) => t.slug === slug);
    if (match) return toolIcon(match.icon);
  }
  return ImageIcon;
}
