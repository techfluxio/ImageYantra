import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadIcon, CheckIcon, DownloadIcon, CloseIcon } from '../../utils/icons.jsx';
import { ToolCard } from '../cards/index.jsx';
import { formatFileSize } from '../../utils/helpers.js';

/* ── Upload Zone ─────────────────────────────────────── */
export function UploadZone({ onFile, accept = 'image/*', multiple = false, note }) {
  const [isDrag, setIsDrag] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setIsDrag(false);
    const files = multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]];
    if (files.length) onFile(multiple ? files : files[0]);
  }

  function handleFileInput(e) {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0];
    if (files) onFile(files);
  }

  return (
    <div
      className={`upload-zone ${isDrag ? 'is-drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload file — click or drag and drop"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
      <div className="upload-zone__icon">
        <UploadIcon size={44} />
      </div>
      <div className="upload-zone__title">
        {isDrag ? 'Drop your file here' : 'Drop your file here'}
      </div>
      <p className="upload-zone__sub">or click to browse from your device</p>
      <button
        className="btn btn--primary btn--md"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
      >
        Choose file
      </button>
      <p className="upload-zone__note">
        {note || 'Processing happens privately in your browser — nothing is uploaded to a server.'}
      </p>
    </div>
  );
}

/* ── Processing State ────────────────────────────────── */
export function ProcessingState({ file }) {
  return (
    <div
      style={{
        marginTop: 'var(--sp-5)',
        padding: 'var(--sp-5)',
        background: 'var(--col-accent-xl)',
        borderRadius: 'var(--r-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 20,
          height: 20,
          border: '2px solid var(--col-accent)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.85s linear infinite',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--col-accent)' }}>
          Processing {file?.name}…
        </div>
        <div style={{ fontSize: 12, color: 'var(--col-text2)', marginTop: 2 }}>
          {file?.size ? formatFileSize(file.size) : ''} — working in your browser
        </div>
      </div>
    </div>
  );
}

/* ── Tool Result ─────────────────────────────────────── */
export function ToolResult({ file, outputSize, onReset }) {
  function handleDownload() {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imageyantra-${file.name}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }
  return (
    <div className="result-card">
      <div className="result-card__success-icon">
        <CheckIcon size={28} />
      </div>
      <div className="result-card__title">Done! Your file is ready.</div>
      <p className="result-card__sub">
        {file?.name && (
          <>
            <strong>{file.name}</strong>
            {outputSize && (
              <> · {formatFileSize(file.size)} → <strong style={{ color: 'var(--col-green)' }}>{formatFileSize(outputSize)}</strong></>
            )}
          </>
        )}
      </p>
      <div className="result-card__actions">
        <button className="btn btn--primary btn--md" onClick={handleDownload}>
          <DownloadIcon size={16} /> Download result
        </button>
        <button className="btn btn--secondary btn--md" onClick={onReset}>
          Process another file
        </button>
      </div>
    </div>
  );
}

/* ── How It Works ────────────────────────────────────── */
const DEFAULT_STEPS = [
  { n: 1, title: 'Upload your file', desc: 'Drop or click to select any image or PDF from your device.' },
  { n: 2, title: 'Adjust settings',  desc: 'Set quality, dimensions or other options to fit your needs.' },
  { n: 3, title: 'Download result',  desc: 'Your processed file downloads instantly — nothing stored.' },
];

export function HowItWorks({ steps = DEFAULT_STEPS }) {
  return (
    <div className="how-it-works" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)' }}>
      {steps.map((step) => (
        <div
          key={step.n}
          style={{
            background: 'var(--col-white)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--col-border)',
            padding: 'var(--sp-5)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--r-sm)',
              background: 'var(--col-accent-xl)',
              color: 'var(--col-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--ff-head)',
              fontWeight: 800,
              fontSize: 14,
              marginBottom: 'var(--sp-3)',
            }}
          >
            {step.n}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--col-text)', marginBottom: 6 }}>{step.title}</div>
          <p style={{ fontSize: 13, color: 'var(--col-text2)', lineHeight: 'var(--lh-relaxed)' }}>{step.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Related Tools ───────────────────────────────────── */
export function RelatedTools({ tools = [], currentSlug }) {
  const filtered = tools.filter((t) => t.slug !== currentSlug).slice(0, 3);
  if (!filtered.length) return null;
  return (
    <div style={{ marginTop: 'var(--sp-10)' }}>
      <h2
        className="font-head"
        style={{ fontSize: 22, fontWeight: 700, color: 'var(--col-text)', marginBottom: 'var(--sp-5)' }}
      >
        Related tools
      </h2>
      <div className="grid-tools">
        {filtered.map((tool, i) => (
          <ToolCard key={tool.slug} tool={tool} delay={i + 1} />
        ))}
      </div>
    </div>
  );
}
