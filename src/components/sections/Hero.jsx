import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch.js';
import { getToolIcon, getAuthorityIcon, SearchIcon, CloseIcon, ExtLinkIcon, ExamIcon } from '../../utils/icons.jsx';
import { POPULAR_CHIPS } from '../../data/index.js';

/* ── A single autocomplete result row ─────────────────── */
function ResultRow({ icon, name, desc, onSelect }) {
  return (
    <button className="autocomplete__item" onMouseDown={onSelect}>
      <span className="autocomplete__icon">{icon}</span>
      <div className="autocomplete__text">
        <div className="autocomplete__name">{name}</div>
        {desc && <div className="autocomplete__desc">{desc.slice(0, 64)}</div>}
      </div>
      <ExtLinkIcon size={11} style={{ marginLeft: 'auto', color: 'var(--col-text3)', flexShrink: 0 }} />
    </button>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const { query, results, showPanel, handleChange, handleFocus, handleBlur, clear } = useSearch();
  const inputRef = useRef(null);

  // '/' keyboard shortcut to focus search
  useEffect(() => {
    function handleKey(e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function goTo(path) {
    clear();
    navigate(path);
  }

  function handleChipClick(chip) {
    handleChange(chip);
    inputRef.current?.focus();
  }

  const { exams, examTools, tools } = results;

  return (
    <section className="hero" style={{ padding: 'var(--sp-9) 0 var(--sp-8)' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            width: '100%',
          }}
        >
          {/* Headline */}
          <h1
            className="font-head anim-fade-up"
            style={{
              fontSize: 'clamp(22px, 2.6vw, 30px)',
              fontWeight: 800,
              color: 'var(--col-text)',
              lineHeight: 'var(--lh-tight)',
              letterSpacing: '-0.02em',
              maxWidth: 720,
              margin: '0 0 var(--sp-6)',
            }}
          >
            Compress, resize, convert, and optimize images, PDFs, and exam documents—instantly in your{' '}
            <span style={{ color: 'var(--col-accent)' }}>BROWSER</span>.
          </h1>

          {/* Search */}
          <div
            className="anim-fade-up d2"
            style={{ width: '100%', maxWidth: 640, margin: '0', position: 'relative', zIndex: 50 }}
          >
            <div className={`search-bar ${query ? 'is-focused' : ''}`} style={{ padding: '14px 20px' }}>
              <span className="search-bar__icon">
                <SearchIcon size={18} />
              </span>
              <input
                ref={inputRef}
                className="search-bar__input"
                type="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Search Tools - compress image, ssc photo, etc"
                aria-label="Search tools and exams"
                autoComplete="off"
              />
              {query ? (
                <button className="search-bar__clear" onClick={clear} aria-label="Clear search">
                  <CloseIcon size={16} />
                </button>
              ) : (
                <span className="search-bar__shortcut" title="Press / to focus">/</span>
              )}
            </div>

            {/* Grouped autocomplete panel */}
            {showPanel && (
              <div className="autocomplete anim-fade-down">
                {exams.length > 0 && (
                  <div className="autocomplete__group">
                    <div className="autocomplete__group-label">Exams</div>
                    {exams.map((exam) => (
                      <ResultRow
                        key={exam.slug}
                        icon={getAuthorityIcon(exam.authorityId, 15)}
                        name={exam.name}
                        desc={exam.desc}
                        onSelect={() => goTo(`/exam-tools/${exam.slug}`)}
                      />
                    ))}
                  </div>
                )}

                {examTools.length > 0 && (
                  <div className="autocomplete__group">
                    <div className="autocomplete__group-label">Exam document tools</div>
                    {examTools.map((et) => (
                      <ResultRow
                        key={et.slug}
                        icon={getToolIcon(et.icon, 15)}
                        name={et.name}
                        desc={et.desc}
                        onSelect={() => goTo(et._path)}
                      />
                    ))}
                  </div>
                )}

                {tools.length > 0 && (
                  <div className="autocomplete__group">
                    <div className="autocomplete__group-label">Tools</div>
                    {tools.map((tool) => (
                      <ResultRow
                        key={tool.slug}
                        icon={getToolIcon(tool.icon, 15)}
                        name={tool.name}
                        desc={tool.desc}
                        onSelect={() => goTo(`/tools/${tool.slug}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Popular chips — hidden while the autocomplete panel is open */}
          {!showPanel && (
            <div
              className="anim-fade-up d3 hero__chips"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                marginTop: 'var(--sp-5)',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--col-text3)', fontWeight: 500, flexShrink: 0 }}>Popular:</span>
              {POPULAR_CHIPS.map((chip) => (
                <button key={chip} className="chip" onClick={() => handleChipClick(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
