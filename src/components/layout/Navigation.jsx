import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGE_TOOLS } from '../../data/imageTools.js';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { ID_PHOTO_SIZES, CATEGORIES as STATIC_CATEGORIES } from '../../data/index.js';
import { EXAM_TOOLS } from '../../data/examTools.js';
import { fetchLiveCategories, fetchLiveTools, mergeBySlug } from '../../utils/publicApi.js';

/* Categories that already have their own bespoke mega menu below and
   shouldn't also appear in the generic "More" dropdown. */
const MEGA_MENU_CATEGORY_SLUGS = new Set(['image-tools', 'pdf-tools', 'exam-tools', 'id-photo-sizes']);

import { ChevDownIcon, MenuIcon, CloseIcon, ExtLinkIcon } from '../../utils/icons.jsx';
import { toolIcon } from '../../utils/toolIcons.js';
import logoMark from '../../assets/images/logo-64.png';

/** Merges a category's bundled static tools with any admin-added tools
 *  for that same category, so a newly created tool shows up in the nav
 *  dropdown immediately instead of only after the next full rebuild. */
function mergeLiveTools(staticList, liveTools, categorySlug) {
  if (!liveTools) return staticList;
  const forCategory = liveTools.filter((t) => t.category_slug === categorySlug);
  return mergeBySlug(staticList, forCategory, 'slug');
}

/* ── Image Tools Mega Menu ───────────────────────────── */
function ImageMegaMenu({ isOpen, onNavigate, liveTools }) {
  const tools = mergeLiveTools(IMAGE_TOOLS, liveTools, 'image-tools');
  return (
    <div className={`mega-panel mega-panel--image ${isOpen ? 'is-open' : ''}`}>
      <div className="mega-panel__scroll">
        <div className="nav__mega-section-label">Image Tools</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {tools.slice(0, 10).map((tool) => {
            const Icon = toolIcon(tool.icon);
            return (
              <button
                key={tool.slug}
                className="nav__mega-item"
                onClick={() => onNavigate(`/tools/${tool.slug}`)}
              >
                <span className="nav__mega-icon nav__mega-icon--purple"><Icon size={17} /></span>
                <div>
                  <div className="nav__mega-label">{tool.name}</div>
                  <div className="nav__mega-desc">{tool.desc.split('.')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="nav__mega-divider" />
      <div className="nav__mega-footer">
        <button className="open-link" onClick={() => onNavigate('/image-tools')}>
          View all Image Tools <ExtLinkIcon size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── PDF Tools Mega Menu ─────────────────────────────── */
function PDFMegaMenu({ isOpen, onNavigate, liveTools }) {
  const tools = mergeLiveTools(PDF_TOOLS, liveTools, 'pdf-tools');
  return (
    <div className={`mega-panel mega-panel--pdf ${isOpen ? 'is-open' : ''}`}>
      <div className="mega-panel__scroll">
        <div className="nav__mega-section-label">PDF Tools</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {tools.slice(0, 10).map((tool) => {
            const Icon = toolIcon(tool.icon);
            return (
              <button
                key={tool.slug}
                className="nav__mega-item"
                onClick={() => onNavigate(`/tools/${tool.slug}`)}
              >
                <span className="nav__mega-icon nav__mega-icon--red"><Icon size={17} /></span>
                <div>
                  <div className="nav__mega-label">{tool.name}</div>
                  <div className="nav__mega-desc">{tool.desc.split('.')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="nav__mega-divider" />
      <div className="nav__mega-footer">
        <button className="open-link" onClick={() => onNavigate('/pdf-tools')}>
          View all PDF Tools <ExtLinkIcon size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── ID Photo Sizes Mega Menu ────────────────────────── */
function IdPhotoMegaMenu({ isOpen, onNavigate, liveTools }) {
  const tools = mergeLiveTools(ID_PHOTO_SIZES, liveTools, 'id-photo-sizes');
  return (
    <div className={`mega-panel mega-panel--image ${isOpen ? 'is-open' : ''}`}>
      <div className="nav__mega-section-label">ID Photo Sizes</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {tools.map((tool) => {
          const Icon = toolIcon(tool.icon);
          return (
            <button
              key={tool.slug}
              className="nav__mega-item"
              onClick={() => onNavigate(`/tools/${tool.slug}`)}
            >
              <span className="nav__mega-icon nav__mega-icon--blue"><Icon size={17} /></span>
              <div>
                <div className="nav__mega-label">{tool.name}</div>
                <div className="nav__mega-desc">{tool.desc.split('.')[0]}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="nav__mega-divider" />
      <div className="nav__mega-footer">
        <button className="open-link" onClick={() => onNavigate('/id-photo-sizes')}>
          View all ID Photo Sizes <ExtLinkIcon size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Exam Tools Mega Menu ────────────────────────────── */
function truncate(text, max = 46) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function ExamMegaMenu({ isOpen, onNavigate, liveTools }) {
  const tools = mergeLiveTools(EXAM_TOOLS, liveTools, 'exam-tools');
  return (
    <div className={`mega-panel mega-panel--exam ${isOpen ? 'is-open' : ''}`}>
      <div className="mega-panel__scroll">
        <div className="nav__mega-section-label">Exam Tools</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {tools.slice(0, 10).map((tool) => {
            const Icon = toolIcon(tool.icon);
            return (
              <button
                key={tool.slug}
                className="nav__mega-item"
                onClick={() => onNavigate(`/tools/${tool.slug}`)}
              >
                <span className="nav__mega-icon nav__mega-icon--green"><Icon size={17} /></span>
                <div>
                  <div className="nav__mega-label">{tool.name}</div>
                  <div className="nav__mega-desc">{truncate(tool.desc)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="nav__mega-divider" />
      <div className="nav__mega-footer">
        <button className="open-link" onClick={() => onNavigate('/exam-tools')}>
          View all Exam Tools <ExtLinkIcon size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Mobile Drawer ───────────────────────────────────── */
/* Architecture matches the original production site: the drawer sits
   BELOW the always-visible nav bar (top: var(--nav-h), not top: 0), so
   the nav never has to "stay sticky above" anything — it just always is.
   The toggle button itself morphs into a close icon; the drawer has no
   header of its own. Scroll lock uses overflow:hidden + a touchmove
   guard (not position:fixed on body, which causes ghost repaints on
   Android Chrome — learned the hard way on the original site). */
function MobileDrawer({ isOpen, onClose, onNavigate, moreCategories = [], liveTools }) {
  const drawerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    function lockTouch(e) {
      // Allow scrolling inside the drawer itself; block scroll-through elsewhere.
      if (drawerRef.current && drawerRef.current.contains(e.target)) return;
      e.preventDefault();
    }
    document.addEventListener('touchmove', lockTouch, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', lockTouch);
    };
  }, [isOpen]);

  const navTo = (path) => { onNavigate(path); onClose(); };

  // React's server renderer doesn't support portals at all, and this drawer
  // is only ever meaningful once the user can actually click things, so we
  // simply don't render it until after the client has mounted.
  if (!mounted) return null;

  return createPortal(
    <>
      <div className={`nav-backdrop ${isOpen ? 'is-open' : ''}`} onClick={onClose} />
      <div
        ref={drawerRef}
        className={`nav-drawer ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="nav-drawer__section">Image Tools</div>
        {mergeLiveTools(IMAGE_TOOLS, liveTools, 'image-tools').map((t) => {
          const Icon = toolIcon(t.icon);
          return (
            <button key={t.slug} className="nav-drawer__item" onClick={() => navTo(`/tools/${t.slug}`)}>
              <span className="nav-drawer__item-icon"><Icon size={14} /></span>
              {t.name}
            </button>
          );
        })}

        <div className="nav-drawer__section">PDF Tools</div>
        {mergeLiveTools(PDF_TOOLS, liveTools, 'pdf-tools').map((t) => {
          const Icon = toolIcon(t.icon);
          return (
            <button key={t.slug} className="nav-drawer__item" onClick={() => navTo(`/tools/${t.slug}`)}>
              <span className="nav-drawer__item-icon" style={{ background: 'var(--col-red-bg)', color: 'var(--col-red)' }}><Icon size={14} /></span>
              {t.name}
            </button>
          );
        })}

        <div className="nav-drawer__section">More</div>
        {[
          { label: 'Exam Tools',     path: '/exam-tools' },
          { label: 'ID Photo Sizes', path: '/id-photo-sizes' },
          ...moreCategories.map((c) => ({ label: c.name, path: `/${c.slug}` })),
          { label: 'Blog',           path: '/blog' },
        ].map((item) => (
          <button key={item.path} className="nav-drawer__item" onClick={() => navTo(item.path)}>
            {item.label}
          </button>
        ))}

        <div style={{ padding: '16px var(--sp-3)' }}>
          <button
            className="btn btn--primary btn--md"
            style={{ width: '100%' }}
            onClick={() => navTo('/')}
          >
            Explore all tools
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ── "More" Menu — every category that doesn't have its own bespoke
   mega menu above (Social Tools, Other Tools, and any brand-new
   category created in the admin panel) shows up here automatically,
   so new categories need zero code changes to appear in navigation. */
function MoreCategoriesMenu({ isOpen, onNavigate, categories }) {
  if (!categories.length) return null;
  return (
    <div className={`mega-panel mega-panel--image ${isOpen ? 'is-open' : ''}`}>
      <div className="nav__mega-section-label">More Tools</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            className="nav__mega-item"
            onClick={() => onNavigate(`/${cat.slug}`)}
          >
            <div>
              <div className="nav__mega-label">{cat.name}</div>
              <div className="nav__mega-desc">{(cat.description || cat.desc || '').split('.')[0]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Navigation ──────────────────────────────────────── */
export default function Navigation() {
  const [openMenu, setOpenMenu] = useState(null); // 'image' | 'pdf' | 'exam' | 'more'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveCategories, setLiveCategories] = useState(null);
  const [liveTools, setLiveTools] = useState(null);
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiveCategories().then((c) => { if (c) setLiveCategories(c); });
    fetchLiveTools().then((t) => { if (t) setLiveTools(t); });
  }, []);

  const moreCategories = useMemo(() => {
    const merged = mergeBySlug(
      STATIC_CATEGORIES.map((c) => ({ ...c, slug: c.id })),
      liveCategories,
      'slug',
    );
    return merged.filter((c) => !MEGA_MENU_CATEGORY_SLUGS.has(c.slug));
  }, [liveCategories]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const toggle = (key) => setOpenMenu((p) => (p === key ? null : key));

  const handleNavigate = (path) => {
    setOpenMenu(null);
    navigate(path);
  };

  // "Explore tools" should always land the user on the categories
  // section — if already on the homepage, navigate() to '/' is a
  // no-op, so scroll to the section directly instead.
  const goToCategories = () => {
    setOpenMenu(null);
    setDrawerOpen(false);
    if (window.location.pathname === '/') {
      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const NAV_ITEMS = [
    { key: 'image', label: 'Image Tools',    Menu: ImageMegaMenu   },
    { key: 'pdf',   label: 'PDF Tools',      Menu: PDFMegaMenu     },
    { key: 'exam',  label: 'Exam Tools',     Menu: ExamMegaMenu    },
    { key: 'idphoto', label: 'ID Photo Sizes', Menu: IdPhotoMegaMenu },
    ...(moreCategories.length
      ? [{ key: 'more', label: 'More', Menu: (props) => <MoreCategoriesMenu {...props} categories={moreCategories} /> }]
      : []),
  ];

  return (
    <nav className="nav" ref={navRef}>
      <div className="nav__inner container--nav" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {/* Logo */}
        <Link to="/" className="nav__logo" onClick={() => setOpenMenu(null)} aria-label="ImageYantra — Home">
          <img src={logoMark} alt="ImageYantra logo" className="nav__logo-mark" width={32} height={32} />
          <span className="nav__logo-text">
            Image<em>Yantra</em>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="nav__links hide-mobile">
          {NAV_ITEMS.map(({ key, label, Menu }) => (
            <div key={key} className="nav__dropdown">
              <button
                className={`nav__link ${openMenu === key ? 'is-active' : ''}`}
                onClick={() => toggle(key)}
                aria-expanded={openMenu === key}
                aria-haspopup="true"
              >
                {label}
                <span className="nav__chevron" style={{ transform: openMenu === key ? 'rotate(180deg)' : 'none' }}>
                  <ChevDownIcon size={13} />
                </span>
              </button>
              <Menu isOpen={openMenu === key} onNavigate={handleNavigate} liveTools={liveTools} />
            </div>
          ))}

          <Link to="/blog" className="nav__link" onClick={() => setOpenMenu(null)}>
            Blog
          </Link>
        </div>

        {/* CTA */}
        <div className="hide-mobile" style={{ marginLeft: 'var(--sp-4)' }}>
          <button
            className="btn btn--primary btn--sm nav__cta"
            onClick={goToCategories}
          >
            Get started
          </button>
        </div>

        {/* Mobile toggle — morphs into a close icon while the drawer is open */}
        <button
          className="show-mobile nav__mobile-btn"
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--col-text)', padding: 4 }}
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(path) => { navigate(path); }}
        moreCategories={moreCategories}
        liveTools={liveTools}
      />
    </nav>
  );
}