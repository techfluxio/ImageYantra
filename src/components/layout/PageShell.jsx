import { Image as ImageIcon } from 'lucide-react';
import { useLiveAds } from '../../hooks/useLiveAds.js';
import { findAdSlot } from '../../utils/publicApi.js';

const ADSENSE_CLIENT_ID = 'ca-pub-2178808063904703';

/** Real AdSense unit — only rendered once a slot ID is resolved from the
 *  admin panel (or a hardcoded fallback, if you ever want one). */
function AdUnit({ slotId }) {
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', aspectRatio: '1 / 1' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format="rectangle"
    />
  );
}

/** Dashed square placeholder shown until a real slot ID is configured
 *  in the admin panel (Ads screen). */
function AdPlaceholder() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50">
      <div className="flex flex-col items-center gap-1.5">
        <ImageIcon className="h-6 w-6 text-neutral-300" />
        <span className="text-xs font-medium text-neutral-400">Advertisement</span>
      </div>
      <span className="absolute bottom-1.5 right-2 text-[10px] font-medium uppercase tracking-wide text-neutral-300">
        Ad
      </span>
    </div>
  );
}

/**
 * Left ad rail — two stacked square ad slots inside one shared card.
 * Hidden below the `lg` breakpoint. Both squares are admin-manageable
 * (placement keys "rail-top" / "rail-bottom") — toggle on/off or change
 * the slot ID from Admin → Ads with no redeploy needed.
 */
export function AdRail() {
  const liveAds = useLiveAds();
  const top = findAdSlot(liveAds, 'rail-top', '');
  const bottom = findAdSlot(liveAds, 'rail-bottom', '');

  return (
    <aside className="hidden w-[300px] shrink-0 lg:block">
      <div className="sticky top-16 space-y-3 overflow-hidden rounded-2xl border border-violet-200 bg-white p-3">
        {top.enabled && (top.slot ? <AdUnit slotId={top.slot} /> : <AdPlaceholder />)}
        {bottom.enabled && (bottom.slot ? <AdUnit slotId={bottom.slot} /> : <AdPlaceholder />)}
      </div>
    </aside>
  );
}

/**
 * Shared page shell: clears the fixed navbar, renders the sticky ad rail
 * on the left, and gives page content a flex-1 <main> slot on the right.
 * Footer is rendered globally in App.jsx, outside this component, so the
 * ad rail naturally unsticks once the footer is reached.
 *
 * Usage in any page:
 *   <PageShell>
 *     ...page content...
 *   </PageShell>
 */
export default function PageShell({ children, className = '' }) {
  return (
    <div className="bg-white text-neutral-900" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="flex w-full gap-6 px-4 py-8 md:px-8 md:py-10">
        <AdRail />
        <main className={`min-w-0 flex-1 ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
