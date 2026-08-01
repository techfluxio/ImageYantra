/**
 * BlogCoverIllustrations.jsx
 * Original flat-style vector illustrations for each blog category —
 * layered cards/icons with soft background accents, matching the
 * site's own brand palette per category instead of emoji or a plain
 * icon-on-gradient. Self-contained, no external assets.
 */

export function ImageCover() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#F5F0FF" />
      <circle cx="90" cy="180" r="90" fill="#EDE0FF" opacity="0.6" />
      <circle cx="330" cy="30" r="60" fill="#E4D4FF" opacity="0.5" />
      <g transform="rotate(-6 160 110)">
        <rect x="90" y="50" width="140" height="110" rx="12" fill="#FFFFFF" stroke="#D6BFFA" strokeWidth="3" />
        <circle cx="118" cy="80" r="10" fill="#F2C078" />
        <path d="M 104 138 L 140 100 L 164 122 L 188 96 L 218 138 Z" fill="#B794F6" />
      </g>
      <g transform="rotate(4 220 110)">
        <rect x="150" y="60" width="140" height="110" rx="12" fill="#FFFFFF" stroke="#8133E0" strokeWidth="3" />
        <circle cx="178" cy="90" r="10" fill="#F2C078" />
        <path d="M 164 148 L 200 110 L 224 132 L 248 106 L 278 148 Z" fill="#8133E0" />
      </g>
      <g transform="translate(300 150)">
        <rect x="-32" y="-18" width="76" height="54" rx="12" fill="#5B21B6" />
        <rect x="-10" y="-30" width="26" height="14" rx="4" fill="#5B21B6" />
        <circle cx="6" cy="10" r="20" fill="#EDE0FF" />
        <circle cx="6" cy="10" r="12" fill="#8133E0" />
        <circle cx="6" cy="10" r="5" fill="#EDE0FF" />
      </g>
    </svg>
  );
}

export function PdfCover() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#FFF1F1" />
      <circle cx="330" cy="180" r="90" fill="#FFDEDE" opacity="0.6" />
      <circle cx="60" cy="30" r="60" fill="#FFE4E4" opacity="0.5" />
      <g transform="rotate(-5 170 110)">
        <rect x="100" y="45" width="120" height="150" rx="10" fill="#FFD5D5" />
      </g>
      <g transform="rotate(4 190 110)">
        <rect x="120" y="35" width="120" height="150" rx="10" fill="#FFFFFF" stroke="#E63946" strokeWidth="3" />
        <rect x="138" y="60" width="84" height="9" rx="4.5" fill="#E63946" opacity="0.85" />
        <rect x="138" y="80" width="84" height="6" rx="3" fill="#F5B4B4" />
        <rect x="138" y="94" width="60" height="6" rx="3" fill="#F5B4B4" />
        <rect x="138" y="108" width="84" height="6" rx="3" fill="#F5B4B4" />
        <rect x="138" y="122" width="50" height="6" rx="3" fill="#F5B4B4" />
      </g>
      <g transform="translate(295 150)">
        <circle r="30" fill="#E63946" />
        <path d="M -12 0 l 8 9 l 18 -20" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function ExamCover() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#EEFBF3" />
      <circle cx="340" cy="170" r="90" fill="#D6F5E3" opacity="0.6" />
      <circle cx="50" cy="30" r="55" fill="#DDF7E8" opacity="0.5" />
      <g transform="rotate(-4 190 110)">
        <rect x="110" y="45" width="150" height="120" rx="10" fill="#FFFFFF" stroke="#34D399" strokeWidth="3" />
        <circle cx="150" cy="80" r="18" fill="#D6F5E3" stroke="#10B981" strokeWidth="2" />
        <path d="M 142 80 l 6 6 l 12 -13" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="178" y="70" width="66" height="7" rx="3.5" fill="#A7F0D0" />
        <rect x="178" y="86" width="50" height="6" rx="3" fill="#A7F0D0" />
        <rect x="126" y="118" width="118" height="6" rx="3" fill="#A7F0D0" />
        <rect x="126" y="132" width="90" height="6" rx="3" fill="#A7F0D0" />
      </g>
      <g transform="translate(300 155)">
        <polygon points="0,-16 44,0 0,16 -44,0" fill="#065F46" />
        <rect x="-7" y="0" width="14" height="24" rx="4" fill="#10B981" />
        <circle cx="0" cy="24" r="5" fill="#065F46" />
      </g>
    </svg>
  );
}

export function SocialCover() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#FFF8E8" />
      <circle cx="80" cy="180" r="90" fill="#FDECC8" opacity="0.6" />
      <circle cx="330" cy="30" r="55" fill="#FEF0D4" opacity="0.5" />
      <g transform="rotate(-5 165 110)">
        <rect x="115" y="35" width="90" height="150" rx="16" fill="#FFFFFF" stroke="#F5B441" strokeWidth="3" />
      </g>
      <g transform="rotate(4 185 110)">
        <rect x="135" y="45" width="90" height="150" rx="16" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3" />
        <rect x="149" y="64" width="62" height="9" rx="4.5" fill="#FDE0A0" />
        <rect x="149" y="84" width="62" height="34" rx="8" fill="#FEF3D8" />
        <circle cx="166" cy="101" r="8" fill="#F59E0B" />
        <rect x="180" y="96" width="24" height="5" rx="2.5" fill="#F5B441" />
        <rect x="180" y="106" width="18" height="5" rx="2.5" fill="#F5B441" />
      </g>
      <g transform="translate(300 90)">
        <path d="M -38 -24 h 76 a 11 11 0 0 1 11 11 v 26 a 11 11 0 0 1 -11 11 h -48 l -17 15 v -15 h -11 a 11 11 0 0 1 -11 -11 v -26 a 11 11 0 0 1 11 -11 z" fill="#F59E0B" />
        <circle cx="-13" cy="0" r="4" fill="#fff" />
        <circle cx="0" cy="0" r="4" fill="#fff" />
        <circle cx="13" cy="0" r="4" fill="#fff" />
      </g>
    </svg>
  );
}

export function GovtCover() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#EFF7FF" />
      <circle cx="330" cy="180" r="90" fill="#DAEBFF" opacity="0.6" />
      <circle cx="55" cy="30" r="55" fill="#E4F1FF" opacity="0.5" />
      <g transform="rotate(-4 195 110)">
        <rect x="105" y="55" width="180" height="112" rx="12" fill="#DAEBFF" />
      </g>
      <g transform="rotate(3 205 110)">
        <rect x="115" y="45" width="180" height="112" rx="12" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="3" />
        <circle cx="152" cy="86" r="21" fill="#DAEBFF" stroke="#0EA5E9" strokeWidth="2" />
        <circle cx="152" cy="79" r="8" fill="#0EA5E9" />
        <path d="M 138 100 a 14 12 0 0 1 28 0 z" fill="#0EA5E9" />
        <rect x="186" y="70" width="90" height="8" rx="4" fill="#BAE0FD" />
        <rect x="186" y="86" width="72" height="6" rx="3" fill="#BAE0FD" />
        <rect x="186" y="100" width="60" height="6" rx="3" fill="#BAE0FD" />
        <rect x="130" y="128" width="140" height="10" rx="5" fill="#0EA5E9" opacity="0.85" />
      </g>
    </svg>
  );
}

export function OtherCover() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#F5F6F7" />
      <circle cx="80" cy="170" r="90" fill="#E9EAEC" opacity="0.6" />
      <circle cx="330" cy="30" r="55" fill="#EEEFF1" opacity="0.5" />
      <g transform="rotate(-4 195 110)">
        <rect x="120" y="55" width="150" height="110" rx="12" fill="#E5E7EB" />
      </g>
      <g transform="translate(150 65)">
        <rect x="0" y="0" width="56" height="56" rx="12" fill="#4B5563" />
        <rect x="68" y="0" width="56" height="56" rx="12" fill="#9CA3AF" />
        <rect x="0" y="68" width="56" height="56" rx="12" fill="#9CA3AF" />
        <rect x="68" y="68" width="56" height="56" rx="12" fill="#4B5563" />
      </g>
      <g transform="translate(305 150) rotate(25)">
        <rect x="-8" y="-42" width="16" height="62" rx="8" fill="#374151" />
        <circle cx="0" cy="-42" r="19" fill="none" stroke="#374151" strokeWidth="11" strokeDasharray="32 100" />
      </g>
    </svg>
  );
}