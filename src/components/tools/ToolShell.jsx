import { useCallback, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import ToolWorkspaceLayout from './ToolWorkspaceLayout.jsx';

export default function ToolShell({
  title,
  titleAccent,
  description,
  accept = 'image/*',
  multiple = true,
  maxFiles = 10,
  fileNoun = 'IMAGE',
  workspaceLayout = false,
  children,
  renderResult,
}) {
  const [phase, setPhase] = useState('idle');
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const list = Array.from(incoming).slice(0, maxFiles);
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list].slice(0, maxFiles));
    setPhase('working');
  }, [maxFiles]);

  const api = {
    files,
    setFiles,
    addMore: () => inputRef.current?.click(),
    removeAll: () => { setFiles([]); setPhase('idle'); },
    removeOne: (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx)),
    goToResult: (r) => { setResults(r); setPhase('result'); },
    reset: () => { setFiles([]); setResults(null); setPhase('idle'); },
  };

  const showHeader = title && phase === 'idle';

  return (
    <div className={showHeader ? 'mx-auto max-w-4xl' : ''}>
      {showHeader && (
        <>
          <h1 className="text-center text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
            {title} {titleAccent && <span className="text-violet-600">{titleAccent}</span>}
          </h1>
          {description && (
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500 md:text-base">
              {description}
            </p>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
      />

      {phase === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`mx-auto flex max-w-2xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 text-center transition ${showHeader ? 'mt-8' : ''} ${
            dragOver ? 'border-violet-500 bg-violet-100' : 'border-violet-300 bg-violet-50 hover:bg-violet-100'
          }`}
        >
          <UploadCloud className="h-10 w-10 text-violet-500" />
          <div className="mt-3 text-lg font-bold text-violet-700">
            Select {multiple ? `${fileNoun}S` : fileNoun}
          </div>
          <div className="mt-1 text-sm text-neutral-500">or drag &amp; drop here</div>
        </div>
      )}

      {phase === 'idle' && multiple && (
        <p className="mt-4 text-center text-sm text-neutral-600">
          <strong>Note:</strong> You can select {maxFiles} {fileNoun.toLowerCase()}s at once.
        </p>
      )}

      {phase === 'working' && (
        workspaceLayout
          ? <ToolWorkspaceLayout>{children(files, api)}</ToolWorkspaceLayout>
          : children(files, api)
      )}
      {phase === 'result' && renderResult(results, api)}
    </div>
  );
}
