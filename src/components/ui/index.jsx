import { useState } from 'react';
import { ChevDownIcon, getAuthorityIcon } from '../../utils/icons.jsx';
import { EXAM_GROUPS } from '../../data/examGroups.js';

/* ── Badge ───────────────────────────────────────────── */
export function Badge({ children, variant = 'accent', pill = false, style = {} }) {
  return (
    <span
      className={['badge', `badge--${variant}`, pill ? 'badge--pill' : ''].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </span>
  );
}

/** Resolve authority badge with icon + colour from authorityId */
export function AuthorityBadge({ authorityId, label, withIcon = true, size = 'md' }) {
  const group = EXAM_GROUPS.find((g) => g.id === authorityId);
  const isSm = size === 'sm';
  return (
    <span
      className="badge authority-badge"
      style={{
        background: group?.bg || '#EDE9FE',
        color: group?.color || '#7C3AED',
        gap: isSm ? 4 : 6,
        padding: isSm ? '3px 9px' : '4px 11px',
      }}
    >
      {withIcon && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {getAuthorityIcon(authorityId, isSm ? 11 : 13)}
        </span>
      )}
      {label || group?.label || authorityId?.toUpperCase()}
    </span>
  );
}

/* ── Breadcrumb ──────────────────────────────────────── */
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {i > 0 && <span className="breadcrumb__sep" aria-hidden="true">/</span>}
          {item.to ? (
            <a href={item.to} className="breadcrumb__link">
              {item.label}
            </a>
          ) : (
            <span className="breadcrumb__current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ── FAQAccordion ────────────────────────────────────── */
export function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-item__trigger"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span className="faq-item__question">{question}</span>
        <span className={`faq-item__chevron ${open ? 'is-open' : ''}`}>
          <ChevDownIcon size={16} />
        </span>
      </button>
      <div className={`faq-body ${open ? 'is-open' : ''}`}>
        <p className="faq-item__answer">{answer}</p>
      </div>
    </div>
  );
}

export function FAQAccordion({ items }) {
  return (
    <div className="flex h-full flex-col justify-between">
      {items.map((item, i) => (
        <FAQItem key={i} question={item.q} answer={item.a} />
      ))}
    </div>
  );
}

/* ── SectionLabel ────────────────────────────────────── */
export function SectionLabel({ children }) {
  return <div className="section__label">{children}</div>;
}

/* ── OpenLink ────────────────────────────────────────── */
export function OpenLink({ children, onClick, style = {} }) {
  return (
    <button className="open-link" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

/* ── NewBadge ────────────────────────────────────────── */
export function NewBadge() {
  return (
    <span
      className="badge badge--pill"
      style={{ background: '#EDE9FE', color: '#8133E0', fontSize: '10px', letterSpacing: '.05em' }}
    >
      NEW
    </span>
  );
}