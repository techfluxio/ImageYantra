import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToolIcon, getCategoryIcon, ExtLinkIcon, ClockIcon, ArrowRightIcon, CheckIcon, StarIcon } from '../../utils/icons.jsx';
import { AuthorityBadge, NewBadge } from '../ui/index.jsx';
import { EXAM_GROUPS } from '../../data/examGroups.js';
import { blogCategoryClass } from '../../utils/helpers.js';
import { useLiveAds } from '../../hooks/useLiveAds.js';
import { findAdSlot } from '../../utils/publicApi.js';
import logoMark from '../../assets/images/logo-64.png';

/* ── Ad Column ───────────────────────────────────────── */
/** Single larger sticky advertisement box per side — one on the left,
 *  one on the right of the main content (previously stacked 3 small
 *  squares per side; consolidated into one bigger, better-balanced unit).
 *
 *  Pass `placement` (e.g. "tool-page-left") to let the admin panel
 *  control this slot's ID and on/off state live. Falls back to the
 *  `slots` prop (unchanged, hardcoded) if no placement is given or
 *  the backend is unreachable — nothing breaks either way. */
export function AdColumn({ slots = ['1234567890'], placement }) {
  const liveAds = useLiveAds();
  const fallbackSlot = Array.isArray(slots) ? slots[0] : slots;
  const { slot, enabled } = placement
    ? findAdSlot(liveAds, placement, fallbackSlot)
    : { slot: fallbackSlot, enabled: true };

  if (!enabled) return null;

  return (
    <aside className="ad-column" aria-label="Advertisement">
      <div className="ad-square">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client="ca-pub-2178808063904703"
          data-ad-slot={slot}
          data-ad-format="rectangle"
        />
        {/* Fallback placeholder shown when ads haven't loaded */}
        <span className="ad-square__label">Ad</span>
      </div>
    </aside>
  );
}

/* ── Ad Banner (horizontal) ──────────────────────────── */
/** Wide horizontal ad strip, same admin-controlled placement pattern as
 *  AdColumn — used below results tables / settings panels on tool pages.
 *
 *  Until the admin panel resolves a *real* slot ID for this placement,
 *  `resolvedSlot` stays equal to the hardcoded fallback below — in that
 *  case we skip rendering a dead <ins> (which never becomes an actual ad
 *  without AdSense approval + a real push) and show a plain placeholder
 *  instead, so the box never looks broken. */
const PLACEHOLDER_BANNER_SLOT = '1234567899';

export function AdBanner({ slot = PLACEHOLDER_BANNER_SLOT, placement }) {
  const liveAds = useLiveAds();
  const { slot: resolvedSlot, enabled } = placement
    ? findAdSlot(liveAds, placement, slot)
    : { slot, enabled: true };

  const hasRealSlot = Boolean(resolvedSlot) && resolvedSlot !== PLACEHOLDER_BANNER_SLOT;

  useEffect(() => {
    if (!hasRealSlot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('[AdSense] push failed:', e);
    }
  }, [hasRealSlot, resolvedSlot]);

  if (!enabled) return null;

  if (!hasRealSlot) {
    return (
      <div className="ad-banner-h" aria-label="Advertisement">
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--col-text3)' }}>Advertisement</span>
        <span className="ad-square__label">Ad</span>
      </div>
    );
  }

  return (
    <div className="ad-banner-h" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-2178808063904703"
        data-ad-slot={resolvedSlot}
        data-ad-format="horizontal"
      />
      <span className="ad-square__label">Ad</span>
    </div>
  );
}

/* ── Brand Card ──────────────────────────────────────── */
/** Small "about us" card shown in the homepage left rail, under the
 *  ad box. Purely static/marketing copy — no live data dependency. */
const BRAND_POINTS = [
  '100% Private & Secure',
  'No signup required',
  'Works offline',
  'Free forever',
];

export function BrandCard() {
  return (
    <div className="brand-card">
      <div className="brand-card__head">
        <img src={logoMark} alt="" className="brand-card__logo" width={22} height={22} />
        <span className="brand-card__name">
          Image<em>Yantra</em>
        </span>
      </div>
      <p className="brand-card__desc">
        115+ browser-based tools for images, PDFs, and exam docs. Your files never leave your device.
      </p>
      <ul className="brand-card__list">
        {BRAND_POINTS.map((point) => (
          <li key={point}>
            <span className="brand-card__check"><CheckIcon size={12} /></span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Trust Stats Card ────────────────────────────────── */
/** Dark stat card shown in the homepage left rail — social proof
 *  numbers, static copy alongside the brand card above. */
export function TrustStatsCard() {
  return (
    <div className="trust-card">
      <div className="trust-card__label">Trusted by</div>
      <div className="trust-card__big">2.4M+</div>
      <div className="trust-card__sub">users this month</div>
      <div className="trust-card__stats">
        <div className="trust-card__stat">
          <div className="trust-card__stat-value">115+</div>
          <div className="trust-card__stat-label">Tools</div>
        </div>
        <div className="trust-card__stat">
          <div className="trust-card__stat-value">
            4.9<StarIcon size={13} />
          </div>
          <div className="trust-card__stat-label">Rating</div>
        </div>
      </div>
    </div>
  );
}

/* ── Secondary Ad Placeholder ────────────────────────── */
/** Small dashed ad slot shown lower in the homepage left rail —
 *  a plain placeholder, not a live ad unit. */
export function AdPlaceholderCard() {
  return (
    <div className="ad-placeholder-card">
      <div className="ad-placeholder-card__label">Advertisement</div>
      <div className="ad-placeholder-card__box">
        <strong>Your Ad Here</strong>
        <span>300 × 250</span>
      </div>
    </div>
  );
}

/* ── Mini Tool Card — compact card used inside colored
   category grid bands on the homepage ─────────────────── */
export function MiniToolCard({ icon, name, sub, onClick, delay = 0, tone = 'purple' }) {
  return (
    <button className={`mini-tool-card anim-fade-up d${delay}`} onClick={onClick}>
      <span className={`mini-tool-card__icon mini-tool-card__icon--${tone}`}>{icon}</span>
      <span className="mini-tool-card__text">
        <span className="mini-tool-card__name">{name}</span>
        {sub && <span className="mini-tool-card__sub">{sub}</span>}
      </span>
    </button>
  );
}

/* ── Most Used — compact icon-shortcut row ──────────────── */
export function MostUsedItem({ icon, name, onClick, delay = 0, tone = 'purple' }) {
  return (
    <button className={`most-used-item anim-fade-up d${delay}`} onClick={onClick}>
      <span className={`most-used-item__icon most-used-item__icon--${tone}`}>{icon}</span>
      <span className="most-used-item__label">{name}</span>
    </button>
  );
}

/* ── Tool Card ───────────────────────────────────────── */
export function ToolCard({ tool, delay = 0 }) {
  const navigate = useNavigate();
  return (
    <div
      className={`tool-card anim-fade-up d${delay}`}
      onClick={() => navigate(`/tools/${tool.slug}`)}
      role="article"
    >
      <div className="tool-card__icon">{getToolIcon(tool.icon, 22)}</div>
      <div style={{ flex: 1 }}>
        <div className="tool-card__name">{tool.name}</div>
        <p className="tool-card__desc">{tool.desc}</p>
      </div>
      {tool.isNew && <div><NewBadge /></div>}
      <button
        className="open-link"
        onClick={(e) => { e.stopPropagation(); navigate(`/tools/${tool.slug}`); }}
        style={{ marginTop: 'var(--sp-1)' }}
      >
        Open tool <ExtLinkIcon size={12} />
      </button>
    </div>
  );
}

/* ── Exam Card ───────────────────────────────────────── */
export function ExamCard({ exam, delay = 0 }) {
  const navigate = useNavigate();
  return (
    <div
      className={`exam-card anim-fade-up d${delay}`}
      onClick={() => navigate(`/exam-tools/${exam.slug}`)}
      role="article"
    >
      <div className="exam-card__header">
        <AuthorityBadge authorityId={exam.authorityId} label={exam.authority} />
        <span style={{ fontSize: 11, color: 'var(--col-text3)', fontWeight: 500 }}>
          {exam.tools?.length} tools
        </span>
      </div>
      <div className="exam-card__name">{exam.name}</div>
      <p className="exam-card__desc">{exam.desc}</p>
      <div className="exam-card__footer">
        <div className="exam-card__tools">
          {exam.tools?.slice(0, 2).map((t) => (
            <span key={t} className="exam-card__tool-tag">{t}</span>
          ))}
          {exam.tools?.length > 2 && (
            <span style={{ fontSize: 11, color: 'var(--col-text3)' }}>+{exam.tools.length - 2}</span>
          )}
        </div>
        <button className="open-link" onClick={(e) => { e.stopPropagation(); navigate(`/exam-tools/${exam.slug}`); }}>
          Open <ExtLinkIcon size={11} />
        </button>
      </div>
    </div>
  );
}

/* ── Blog Card ───────────────────────────────────────── */
export function BlogCard({ post, delay = 0 }) {
  const navigate = useNavigate();
  return (
    <div
      className={`blog-card anim-fade-up d${delay}`}
      onClick={() => navigate(`/blog/${post.slug}`)}
      role="article"
    >
      <div className="blog-card__meta">
        <span className={`badge badge--pill ${blogCategoryClass(post.category)}`}>{post.category}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--col-text3)' }}>
          <ClockIcon size={12} /> {post.readTime} min read
        </span>
      </div>
      <div className="blog-card__title">{post.title}</div>
      <p className="blog-card__excerpt">{post.excerpt}</p>
      <div className="blog-card__footer">
        <span style={{ fontSize: 13, color: 'var(--col-text3)' }}>{post.date}</span>
        <button className="open-link" onClick={(e) => { e.stopPropagation(); navigate(`/blog/${post.slug}`); }}>
          Read <ExtLinkIcon size={11} />
        </button>
      </div>
    </div>
  );
}

/* ── Category Card ───────────────────────────────────── */
export function CategoryCard({ category, delay = 0 }) {
  const navigate = useNavigate();
  return (
    <div
      className={`cat-card anim-fade-up d${delay}`}
      onClick={() => navigate(category.path)}
      role="article"
    >
      <div className={`cat-card__icon cat-card__icon--${category.color || 'purple'}`}>{getCategoryIcon(category.id, 22)}</div>
      <div className="cat-card__body">
        <div className="cat-card__name">{category.name}</div>
        <div className="cat-card__count">{category.count}+ tools</div>
      </div>
      <span className="cat-card__arrow"><ArrowRightIcon size={15} /></span>
    </div>
  );
}
