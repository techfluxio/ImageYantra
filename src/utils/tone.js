/**
 * Single source of truth for category → Tailwind tone, keyed off
 * `CATEGORIES[].color` in data/index.js ('purple' | 'red' | 'green' |
 * 'blue' | 'yellow' | 'black'). Used anywhere an icon, accent word, or
 * badge needs to visually match its category — home page sections,
 * category listing pages, and the Most Used strip — so the color never
 * drifts out of sync with the category it represents.
 */
export const TONE = {
  purple: { iconWrap: 'bg-violet-100', iconColor: 'text-violet-600', accent: 'text-violet-600', pill: 'bg-violet-600', ring: 'hover:border-violet-300 hover:text-violet-700' },
  red:    { iconWrap: 'bg-red-100',    iconColor: 'text-red-500',    accent: 'text-red-500',    pill: 'bg-red-500',    ring: 'hover:border-red-300 hover:text-red-600' },
  green:  { iconWrap: 'bg-emerald-100',iconColor: 'text-emerald-600',accent: 'text-emerald-600',pill: 'bg-emerald-600',ring: 'hover:border-emerald-300 hover:text-emerald-700' },
  blue:   { iconWrap: 'bg-blue-100',   iconColor: 'text-blue-500',   accent: 'text-blue-500',   pill: 'bg-blue-500',   ring: 'hover:border-blue-300 hover:text-blue-600' },
  yellow: { iconWrap: 'bg-amber-100',  iconColor: 'text-amber-500',  accent: 'text-amber-500',  pill: 'bg-amber-500',  ring: 'hover:border-amber-300 hover:text-amber-600' },
  black:  { iconWrap: 'bg-neutral-200',iconColor: 'text-neutral-800',accent: 'text-neutral-800',pill: 'bg-neutral-800',ring: 'hover:border-neutral-400 hover:text-neutral-900' },
};

export function getTone(color) {
  return TONE[color] || TONE.purple;
}
