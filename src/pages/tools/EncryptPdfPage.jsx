import { useState } from 'react';
import { reportToolError } from '../../utils/errorReporting.js';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import { encryptPdf, formatBytes } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'unlock-pdf',   name: 'Unlock PDF',   Icon: iconForSlug('unlock-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf', name: 'Compress PDF', Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
  { slug: 'merge-pdf',    name: 'Merge PDF',    Icon: iconForSlug('merge-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'What kind of password protection does this add?', a: 'A real password is required to open the file in any PDF viewer — this isn\u2019t a cosmetic restriction, it\u2019s standard PDF encryption.' },
  { q: 'What if I forget the password?', a: 'There\u2019s no way to recover it — nobody, including us, can open the file without it. Keep it somewhere safe.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Encryption happens entirely in your browser; your file and password never leave your device.' },
];

export default function EncryptPdfPage() {
  return (
    <>
      <Head>
        <title>Lock PDF — ImageYantra</title>
        <meta name="description" content="Add password protection to a PDF file." />
      </Head>
      <PageShell>
        <ToolShell
          title="Lock"
          titleAccent="PDF"
          description="Add a password to a PDF so only people who know it can open the file."
          accept="application/pdf"
          multiple={false}
          maxFiles={1}
          fileNoun="PDF"
          renderResult={(result, api) => (
            <>
              <PdfResult
                blob={result.blob}
                filename={result.filename}
                originalSize={result.originalSize}
                note="Protected with a password — anyone opening this file will need it."
                onReset={api.reset}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <EncryptWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function EncryptWorking({ file, api }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);

  const tooShort = password.length > 0 && password.length < 4;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canRun = password.length >= 4 && password === confirm;

  async function handleEncrypt() {
    if (!canRun) return;
    setBusy(true);
    setError(null);
    try {
      const result = await encryptPdf(file, () => {}, { password });
      setBusy(false);
      api.goToResult({ ...result, originalSize: file.size, filename: file.name.replace(/\.pdf$/i, '') + '-locked.pdf' });
    } catch (e) {
      reportToolError('encrypt-pdf', e);
      setBusy(false);
      setError('Something went wrong while encrypting this PDF. Please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="min-w-0 truncate text-sm font-semibold text-neutral-900">{file?.name}</div>
          <button
            type="button"
            onClick={api.removeAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-50 py-14 text-center">
          <div className="text-2xl font-extrabold text-neutral-900">{formatBytes(file?.size)}</div>
          <div className="text-sm text-neutral-500">current size</div>
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Lock className="h-4 w-4 text-violet-600" /> Lock PDF
          </div>

          <label className="mb-1 block text-xs font-medium text-neutral-600">Password</label>
          <div className="relative mb-3">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 pr-10 text-sm text-neutral-800 focus:border-violet-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="mb-1 block text-xs font-medium text-neutral-600">Confirm password</label>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter the password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:border-violet-500 focus:outline-none"
          />

          {tooShort && <p className="mt-2 text-xs text-rose-500">Use at least 4 characters.</p>}
          {mismatch && <p className="mt-2 text-xs text-rose-500">Passwords don\u2019t match.</p>}

          <div className="mt-3 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            The file will require this password to open, in any PDF viewer.
          </div>
          {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

          <button
            type="button"
            onClick={handleEncrypt}
            disabled={busy || !file || !canRun}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Locking…' : <>Lock PDF <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
