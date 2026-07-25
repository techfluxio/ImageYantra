import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGE_TOOLS } from '../../data/imageTools.js';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { GOVT_TOOLS, CATEGORIES as STATIC_CATEGORIES } from '../../data/index.js';
import { EXAM_GROUPS } from '../../data/examGroups.js';
import { EXAM_TOOLS } from '../../data/examTools.js';
import { fetchLiveCategories, mergeBySlug } from '../../utils/publicApi.js';

/* Categories that already have their own bespoke mega menu below and
   shouldn't also appear in the generic "More" dropdown. */
const MEGA_MENU_CATEGORY_SLUGS = new Set(['image-tools', 'pdf-tools', 'exam-tools', 'id-photo-sizes']);

/* Maps an EXAM_GROUPS id (used by the Authority tabs in the nav) to the
   authority label used inside EXAM_TOOLS[].authorities. The two data
   files were built independently, so a couple of ids don't line up
   1:1 (e.g. the "banking" group tab maps to the "IBPS" authority tag). */
const GROUP_ID_TO_AUTHORITY = {
  nta: 'NTA',
  iit: 'IIT',
  ssc: 'SSC',
  banking: 'IBPS',
  upsc: 'UPSC',
  defence: 'Defence',
  railway: 'Railway',
  teaching: 'Teaching',
  law: 'Law',
};
import { getToolIcon, getAuthorityIcon, ChevDownIcon, MenuIcon, CloseIcon, ExtLinkIcon } from '../../utils/icons.jsx';
import logoMark from '../../assets/images/logo-64.png';

/* ── Image Tools Mega Menu ───────────────────────────── */
function ImageMegaMenu({ isOpen, onNavigate }) {
  return (
    <div className={`mega-panel mega-panel--image ${isOpen ? 'is-open' : ''}`}>
      <div className="mega-panel__scroll">
        <div className="nav__mega-section-label">Image Tools</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {IMAGE_TOOLS.slice(0, 10).map((tool) => (
            <button
              key={tool.slug}
              className="nav__mega-item"
              onClick={() => onNavigate(`/tools/${tool.slug}`)}
            >
              <span className="nav__mega-icon nav__mega-icon--purple">{getToolIcon(tool.icon, 17)}</span>
              <div>
                <div className="nav__mega-label">{tool.name}</div>
                <div className="nav__mega-desc">{tool.desc.split('.')[0]}</div>
              </div>
            </button>
          ))}
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
function PDFMegaMenu({ isOpen, onNavigate }) {
  const groups = [...new Set(PDF_TOOLS.map((t) => t.group))];
  return (
    <div className={`mega-panel mega-panel--pdf ${isOpen ? 'is-open' : ''}`}>
      <div className="mega-panel__scroll">
        {groups.map((group) => (
          <div key={group}>
            <div className="nav__mega-section-label">{group}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {PDF_TOOLS.filter((t) => t.group === group).map((tool) => (
                <button
                  key={tool.slug}
                  className="nav__mega-item"
                  onClick={() => onNavigate(`/tools/${tool.slug}`)}
                >
                  <span className="nav__mega-icon nav__mega-icon--red">{getToolIcon(tool.icon, 17)}</span>
                  <div>
                    <div className="nav__mega-label">{tool.name}</div>
                    <div className="nav__mega-desc">{tool.desc.split('.')[0]}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="nav__mega-divider" />
          </div>
        ))}
      </div>
      <div className="nav__mega-footer">
        <button className="open-link" onClick={() => onNavigate('/pdf-tools')}>
          View all PDF Tools <ExtLinkIcon size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── ID Photo Sizes Mega Menu ────────────────────────── */
function IdPhotoMegaMenu({ isOpen, onNavigate }) {
  return (
    <div className={`mega-panel mega-panel--image ${isOpen ? 'is-open' : ''}`}>
      <div className="nav__mega-section-label">ID Photo Sizes</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {GOVT_TOOLS.map((tool) => (
          <button
            key={tool.slug}
            className="nav__mega-item"
            onClick={() => onNavigate(`/tools/${tool.slug}`)}
          >
            <span className="nav__mega-icon nav__mega-icon--blue">{getToolIcon(tool.icon, 17)}</span>
            <div>
              <div className="nav__mega-label">{tool.name}</div>
              <div className="nav__mega-desc">{tool.desc.split('.')[0]}</div>
            </div>
          </button>
        ))}
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
function ExamMegaMenu({ isOpen, onNavigate }) {
  const [activeGroup, setActiveGroup] = useState('nta');
  const activeAuthority = GROUP_ID_TO_AUTHORITY[activeGroup];
  const activeTools = EXAM_TOOLS.filter((t) => t.authorities.includes(activeAuthority)).slice(0, 8);
  const groupMeta = EXAM_GROUPS.find((g) => g.id === activeGroup);

  return (
    <div className={`mega-panel mega-panel--exam ${isOpen ? 'is-open' : ''}`}>
      <div className="nav__exam-mega-inner">
        {/* Authority tabs */}
        <div className="nav__exam-tabs">
          <div style={{ padding: '4px 8px 8px', fontSize: 10.5, fontWeight: 700, color: 'var(--col-text3)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
            Authority
          </div>
          {EXAM_GROUPS.map((g) => (
            <button
              key={g.id}
              className={`nav__exam-tab ${activeGroup === g.id ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveGroup(g.id)}
              onClick={() => setActiveGroup(g.id)}
            >
              <span
                className="nav__exam-tab-icon"
                style={{
                  background: activeGroup === g.id ? g.bg : 'rgba(0,0,0,.045)',
                  color: activeGroup === g.id ? g.color : 'var(--col-text3)',
                }}
              >
                {getAuthorityIcon(g.id, 13)}
              </span>
              <span className="nav__exam-tab-label">{g.label}</span>
            </button>
          ))}
        </div>

        {/* Exam panel */}
        <div className="nav__exam-panel">
          <div className="nav__exam-panel-header">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--col-text)' }}>
              {groupMeta?.fullName}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--col-text3)' }}>
              {EXAM_TOOLS.filter((t) => t.authorities.includes(activeAuthority)).length} tools
            </span>
          </div>
          <div className="nav__exam-grid">
            {activeTools.map((tool) => (
              <button
                key={tool.slug}
                className="nav__exam-item"
                onClick={() => onNavigate(`/tools/${tool.slug}`)}
              >
                <div className="nav__exam-item-name">{tool.name}</div>
                <div className="nav__exam-item-desc">{tool.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--col-border)', marginTop: 14, paddingTop: 12 }}>
            <button className="open-link" onClick={() => onNavigate('/exam-tools')}>
              View all Exam Tools <ExtLinkIcon size={12} />
            </button>
          </div>
        </div>
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
function MobileDrawer({ isOpen, onClose, onNavigate, moreCategories = [] }) {
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
        {IMAGE_TOOLS.map((t) => (
          <button key={t.slug} className="nav-drawer__item" onClick={() => navTo(`/tools/${t.slug}`)}>
            <span className="nav-drawer__item-icon">{getToolIcon(t.icon, 14)}</span>
            {t.name}
          </button>
        ))}

        <div className="nav-drawer__section">PDF Tools</div>
        {PDF_TOOLS.map((t) => (
          <button key={t.slug} className="nav-drawer__item" onClick={() => navTo(`/tools/${t.slug}`)}>
            <span className="nav-drawer__item-icon" style={{ background: 'var(--col-red-bg)', color: 'var(--col-red)' }}>{getToolIcon(t.icon, 14)}</span>
            {t.name}
          </button>
        ))}

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
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiveCategories().then((c) => { if (c) setLiveCategories(c); });
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
              <Menu isOpen={openMenu === key} onNavigate={handleNavigate} />
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
      />
    </nav>
  );
}
