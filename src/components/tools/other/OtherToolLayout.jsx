export default function OtherToolLayout({ title, titleAccent, description, children }) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
        {title} {titleAccent && <span className="text-neutral-500">{titleAccent}</span>}
      </h1>
      {description && (
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500 md:text-base">
          {description}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}

/** Consistent card wrapper used by every Other Tool panel. */
export function ToolCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-5 ${className}`}>
      {title && (
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-900">
          {Icon && <Icon className="h-4 w-4 text-neutral-500" />} {title}
        </div>
      )}
      {children}
    </div>
  );
}

/** Small "Copy" button that flashes "Copied!" briefly. */
export function CopyButton({ getText, className = '' }) {
  return (
    <button
      type="button"
      onClick={async (e) => {
        const text = getText();
        if (!text) return;
        try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
        const btn = e.currentTarget;
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1200);
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 ${className}`}
    >
      Copy
    </button>
  );
}
