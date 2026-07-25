/* ═══════════════════════════════════════════════
   IMAGEYANTRA — ICON LIBRARY
   All icons are inline SVG for zero-dependency,
   consistent styling and full theme control.
═══════════════════════════════════════════════ */

function Svg({ d, s = 18, sw = '1.8', fill = 'none', className = '' }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

/* ── Image Tool Icons ─────────────────────────── */
export const CompressIcon  = ({ size = 18 }) => <Svg s={size} d={<><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></>}/>;
export const ResizeIcon    = ({ size = 18 }) => <Svg s={size} d={<><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>}/>;
export const CropIcon      = ({ size = 18 }) => <Svg s={size} d={<><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></>}/>;
export const RotateIcon    = ({ size = 18 }) => <Svg s={size} d={<><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/></>}/>;
export const ResolutionIcon = ({ size = 18 }) => <Svg s={size} d={<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>}/>;
export const RemoveBgIcon  = ({ size = 18 }) => <Svg s={size} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="15" y1="9" x2="21" y2="3" strokeDasharray="3 2"/></>}/>;

/* ── PDF Tool Icons ───────────────────────────── */
export const ImgPdfIcon    = ({ size = 18 }) => <Svg s={size} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}/>;
export const MergeIcon     = ({ size = 18 }) => <Svg s={size} d={<><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></>}/>;
export const CompressPdfIcon = ({ size = 18 }) => <Svg s={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="4 14 10 14 10 20"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></>}/>;
export const ArrangeIcon   = ({ size = 18 }) => <Svg s={size} d={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>}/>;
export const ManagePagesIcon = ({ size = 18 }) => <Svg s={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></>}/>;

/* ── Govt / Exam Icons ────────────────────────── */
export const PassportIcon  = ({ size = 18 }) => <Svg s={size} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-1a5 5 0 0 1 10 0v1"/></>}/>;
export const GovtIcon      = ({ size = 18 }) => <Svg s={size} d={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>;
export const ExamIcon      = ({ size = 18 }) => <Svg s={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>}/>;
export const ConvertIcon   = ({ size = 18 }) => <Svg s={size} d={<><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></>}/>;

/* ── Premium Category Icons ───────────────────── */
export const ImagesStackIcon = ({ size = 20 }) => <Svg s={size} d={<><rect x="2" y="6" width="15" height="15" rx="2"/><circle cx="8" cy="11.5" r="1.4"/><path d="m4 19 3.5-3.5a1.5 1.5 0 0 1 2 0L13 19"/><path d="M7 6V4.6A1.6 1.6 0 0 1 8.6 3h11.8A1.6 1.6 0 0 1 22 4.6v11.8a1.6 1.6 0 0 1-1.6 1.6H19"/></>}/>;
export const FileStackIcon   = ({ size = 20 }) => <Svg s={size} d={<><path d="M9 4h7l4 4v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 8 19V5.5A1.5 1.5 0 0 1 9 4z"/><polyline points="16 4 16 8 20 8"/><path d="M5 8.5v11A1.5 1.5 0 0 0 6.5 21H15"/></>}/>;
export const GraduationCapIcon = ({ size = 20 }) => <Svg s={size} d={<><path d="M22 9 12 5 2 9l10 4 10-4z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v7"/></>}/>;
export const BuildingGovIcon  = ({ size = 20 }) => <Svg s={size} d={<><line x1="3" y1="21" x2="21" y2="21"/><path d="M5 21V9l7-5 7 5v12"/><line x1="9" y1="21" x2="9" y2="13"/><line x1="15" y1="21" x2="15" y2="13"/><line x1="3" y1="9" x2="21" y2="9"/></>}/>;

/* ── Examination Authority Icons ───────────────── */
export const ClipboardCheckIcon = ({ size = 18 }) => <Svg s={size} d={<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9z"/><polyline points="9 13 11 15 15 11"/></>}/>;
export const FlaskIcon       = ({ size = 18 }) => <Svg s={size} d={<><path d="M9 2v6.2L4.5 17a2 2 0 0 0 1.8 2.9h11.4a2 2 0 0 0 1.8-2.9L15 8.2V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="9" y1="13" x2="15" y2="13"/></>}/>;
export const BriefcaseIcon   = ({ size = 18 }) => <Svg s={size} d={<><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/></>}/>;
export const BankIcon        = ({ size = 18 }) => <Svg s={size} d={<><line x1="3" y1="21" x2="21" y2="21"/><line x1="4" y1="10" x2="20" y2="10"/><polygon points="12 3 21 10 3 10"/><line x1="6" y1="10" x2="6" y2="21"/><line x1="10" y1="10" x2="10" y2="21"/><line x1="14" y1="10" x2="14" y2="21"/><line x1="18" y1="10" x2="18" y2="21"/></>}/>;
export const LandmarkIcon    = ({ size = 18 }) => <Svg s={size} d={<><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 21 8 3 8"/></>}/>;
export const TrainIcon       = ({ size = 18 }) => <Svg s={size} d={<><rect x="4" y="3" width="16" height="13" rx="3"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="3" x2="8" y2="10"/><line x1="16" y1="3" x2="16" y2="10"/><line x1="8" y1="20" x2="6" y2="23"/><line x1="16" y1="20" x2="18" y2="23"/><circle cx="8.5" cy="13" r="0.6" fill="currentColor"/><circle cx="15.5" cy="13" r="0.6" fill="currentColor"/></>}/>;
export const ScaleIcon       = ({ size = 18 }) => <Svg s={size} d={<><line x1="12" y1="3" x2="12" y2="21"/><line x1="5" y1="7" x2="19" y2="7"/><path d="M5 7 2 14a3 3 0 0 0 6 0z"/><path d="M19 7 16 14a3 3 0 0 0 6 0z"/><line x1="8" y1="21" x2="16" y2="21"/></>}/>;

/* ── Exam Document Tool Icons ──────────────────── */
export const ThumbprintIcon  = ({ size = 18 }) => <Svg s={size} d={<><path d="M12 3a7 7 0 0 0-7 7c0 4 2 6 2 9"/><path d="M12 3a7 7 0 0 1 7 7c0 1.5-.3 2.7-.7 3.7"/><path d="M9 19c-1-2-2-4-2-7a5 5 0 0 1 10 0c0 1 0 2-.5 3.2"/><path d="M9.5 19.5c-.7-1.8-1.5-3.5-1.5-6.5a4 4 0 0 1 8 0c0 1.2-.2 2.1-.5 3"/></>}/>;
export const SignatureIcon   = ({ size = 18 }) => <Svg s={size} d={<><path d="M3 17c1.5 1 3 1 4-.5C8.5 14 9 9 9 9s2 8 4 8 2-3 3-3 1 2 3 2"/><line x1="3" y1="21" x2="21" y2="21"/></>}/>;
export const DocumentCheckIcon = ({ size = 18 }) => <Svg s={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 14 11 16 16 11"/></>}/>;

/* ── UI Icons ─────────────────────────────────── */
export const SearchIcon    = ({ size = 18 }) => <Svg s={size} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
export const ChevDownIcon  = ({ size = 14 }) => <Svg s={size} sw="2" d={<polyline points="6 9 12 15 18 9"/>}/>;
export const ChevUpIcon    = ({ size = 14 }) => <Svg s={size} sw="2" d={<polyline points="18 15 12 9 6 15"/>}/>;
export const ChevRightIcon = ({ size = 14 }) => <Svg s={size} sw="2" d={<polyline points="9 18 15 12 9 6"/>}/>;
export const ExtLinkIcon   = ({ size = 13 }) => <Svg s={size} d={<><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>}/>;
export const UploadIcon    = ({ size = 40 }) => <Svg s={size} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/>;
export const MenuIcon      = ({ size = 18 }) => <Svg s={size} d={<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}/>;
export const CloseIcon     = ({ size = 18 }) => <Svg s={size} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}/>;
export const CheckIcon     = ({ size = 16 }) => <Svg s={size} d={<polyline points="20 6 9 17 4 12"/>}/>;
export const PlusIcon      = ({ size = 16 }) => <Svg s={size} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>;
export const TrashIcon     = ({ size = 18 }) => <Svg s={size} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>}/>;
export const DownloadIcon  = ({ size = 18 }) => <Svg s={size} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/>;
export const InfoIcon      = ({ size = 18 }) => <Svg s={size} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>;
export const ShieldIcon    = ({ size = 18 }) => <Svg s={size} d={<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></>}/>;
export const BarChartIcon  = ({ size = 18 }) => <Svg s={size} d={<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>}/>;
export const ShareIcon     = ({ size = 18 }) => <Svg s={size} d={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>}/>;
export const CheckCircleIcon = ({ size = 18 }) => <Svg s={size} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>;
export const BoltIcon      = ({ size = 18 }) => <Svg s={size} d={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>}/>;
export const MobileIcon    = ({ size = 18 }) => <Svg s={size} d={<><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>}/>;
export const MailIcon      = ({ size = 18 }) => <Svg s={size} d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>;
export const ClockIcon     = ({ size = 18 }) => <Svg s={size} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>;
export const BlogIcon      = ({ size = 18 }) => <Svg s={size} d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}/>;
export const StarIcon      = ({ size = 14, filled = true }) => <Svg s={size} fill={filled ? 'currentColor' : 'none'} d={<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>}/>;
export const ArrowRightIcon = ({ size = 14 }) => <Svg s={size} d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>}/>;
export const UsersIcon      = ({ size = 20 }) => <Svg s={size} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}/>;
export const ChatIcon       = ({ size = 20 }) => <Svg s={size} d={<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>}/>;
export const QrIcon         = ({ size = 18 }) => <Svg s={size} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="21" y1="14" x2="21" y2="14.01"/><line x1="17.5" y1="14" x2="17.5" y2="17.5"/><line x1="14" y1="17.5" x2="17.5" y2="17.5"/><line x1="17.5" y1="21" x2="21" y2="21"/></>}/>;
export const BarcodeIcon    = ({ size = 18 }) => <Svg s={size} d={<><line x1="4" y1="4" x2="4" y2="20"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="11" y1="4" x2="11" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/><line x1="21" y1="4" x2="21" y2="20"/></>}/>;
export const PaletteIcon    = ({ size = 18 }) => <Svg s={size} d={<><circle cx="12" cy="12" r="9.5"/><circle cx="8.5" cy="10" r="1.3" fill="currentColor"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor"/><circle cx="15.7" cy="10" r="1.3" fill="currentColor"/><path d="M8.2 15.5A3 3 0 0 0 11 19.5h1a2 2 0 0 0 0-4 1.3 1.3 0 0 1 0-2.6 3 3 0 0 0 3-3"/></>}/>;
export const HashIcon       = ({ size = 18 }) => <Svg s={size} d={<><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/><line x1="10" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="14" y2="20"/></>}/>;
export const LinkIcon       = ({ size = 18 }) => <Svg s={size} d={<><path d="M10 13a5 5 0 0 0 7.5.4l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.4l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></>}/>;
export const TypeIcon       = ({ size = 18 }) => <Svg s={size} d={<><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></>}/>;
export const CodeIcon       = ({ size = 18 }) => <Svg s={size} d={<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>}/>;
export const TableIcon      = ({ size = 18 }) => <Svg s={size} d={<><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="4" x2="9" y2="20"/></>}/>;
export const ListIcon       = ({ size = 18 }) => <Svg s={size} d={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>}/>;
export const KeyIcon        = ({ size = 18 }) => <Svg s={size} d={<><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.6 12.4 20 3l2 2-2 2 2 2-3 3"/><path d="M14.5 8.5l2 2"/></>}/>;
export const RegexIcon      = ({ size = 18 }) => <Svg s={size} d={<><line x1="4" y1="20" x2="20" y2="4"/><circle cx="6" cy="6" r="1.6" fill="currentColor"/><circle cx="18" cy="18" r="1.6" fill="currentColor"/><path d="M14 4h6v6"/></>}/>;
export const HelpCircleIcon = ({ size = 18 }) => <Svg s={size} d={<><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>;
export const NewspaperIcon  = ({ size = 18 }) => <Svg s={size} d={<><path d="M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M20 20a3 3 0 0 1-3-3V7"/><line x1="7" y1="8" x2="14" y2="8"/><line x1="7" y1="12" x2="14" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/></>}/>;

/* ── Map icon key → component ─────────────────── */
const ICON_MAP = {
  compress:    CompressIcon,
  resize:      ResizeIcon,
  crop:        CropIcon,
  rotate:      RotateIcon,
  resolution:  ResolutionIcon,
  removebg:    RemoveBgIcon,
  imgpdf:      ImgPdfIcon,
  merge:       MergeIcon,
  compresspdf: CompressPdfIcon,
  arrange:     ArrangeIcon,
  manage:      ManagePagesIcon,
  passport:    PassportIcon,
  govt:        GovtIcon,
  exam:        ExamIcon,
  convert:     ConvertIcon,
  thumbprint:  ThumbprintIcon,
  thumb:       ThumbprintIcon,
  signature:   SignatureIcon,
  sigresizer:  SignatureIcon,
  doccheck:    DocumentCheckIcon,
  documents:   DocumentCheckIcon,
  photo:       PassportIcon,
  resizer:     ResizeIcon,
  thumbresizer: ThumbprintIcon,
  dimensions:  ResolutionIcon,
  filesize:    CompressIcon,
  preview:     PassportIcon,
  qr:          QrIcon,
  barcode:     BarcodeIcon,
  color:       PaletteIcon,
  base64:      CodeIcon,
  hash:        HashIcon,
  urlencode:   LinkIcon,
  lorem:       TypeIcon,
  wordcount:   ListIcon,
  case:        TypeIcon,
  json:        CodeIcon,
  csv:         TableIcon,
  markdown:    DocumentCheckIcon,
  regex:       RegexIcon,
  uuid:        KeyIcon,
  timestamp:   ClockIcon,
};

/* ── Map category id → premium icon component ─── */
const CATEGORY_ICON_MAP = {
  'image-tools':   ImagesStackIcon,
  'pdf-tools':     FileStackIcon,
  'exam-tools':    GraduationCapIcon,
  'id-photo-sizes': UsersIcon,
  'social-tools':  ChatIcon,
  'other-tools':   PlusIcon,
};

/* ── Map authority id → icon component ─────────── */
const AUTHORITY_ICON_MAP = {
  nta:      ClipboardCheckIcon,
  iit:      FlaskIcon,
  ssc:      BriefcaseIcon,
  banking:  BankIcon,
  upsc:     LandmarkIcon,
  defence:  ShieldIcon,
  railway:  TrainIcon,
  teaching: GraduationCapIcon,
  law:      ScaleIcon,
};

export function getToolIcon(iconKey, size = 18) {
  const Icon = ICON_MAP[iconKey] || ImgPdfIcon;
  return <Icon size={size} />;
}

export function getCategoryIcon(categoryId, size = 20) {
  const Icon = CATEGORY_ICON_MAP[categoryId] || ImagesStackIcon;
  return <Icon size={size} />;
}

export function getAuthorityIcon(authorityId, size = 16) {
  const Icon = AUTHORITY_ICON_MAP[authorityId] || LandmarkIcon;
  return <Icon size={size} />;
}

export default {
  CompressIcon, ResizeIcon, CropIcon, RotateIcon, ResolutionIcon, RemoveBgIcon,
  ImgPdfIcon, MergeIcon, CompressPdfIcon, ArrangeIcon, ManagePagesIcon,
  PassportIcon, GovtIcon, ExamIcon, ConvertIcon,
  ImagesStackIcon, FileStackIcon, GraduationCapIcon, BuildingGovIcon,
  ClipboardCheckIcon, FlaskIcon, BriefcaseIcon, BankIcon, LandmarkIcon, TrainIcon, ScaleIcon,
  ThumbprintIcon, SignatureIcon, DocumentCheckIcon,
  SearchIcon, ChevDownIcon, ChevUpIcon, ChevRightIcon, ExtLinkIcon, UploadIcon,
  MenuIcon, CloseIcon, CheckIcon, PlusIcon, TrashIcon, DownloadIcon,
  InfoIcon, ShieldIcon, BoltIcon, MobileIcon, MailIcon, ClockIcon, BlogIcon,
  StarIcon, ArrowRightIcon, UsersIcon,
};
