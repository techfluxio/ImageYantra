import { useState } from 'react';
import { reportToolError } from '../../utils/errorReporting.js';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Trash2, LockOpen } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import { unlockPdf, formatBytes } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'merge-pdf',    name: 'Merge PDF',    Icon: iconForSlug('merge-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf', name: 'Compress PDF', Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
  { slug: 'encrypt-pdf',  name: 'Lock PDF',     Icon: iconForSlug('encrypt-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'What kind of "locked" PDFs does this fix?', a: 'PDFs with owner-password restrictions (printing/copying/editing disabled) that open without a password. The restrictions are dropped and a clean copy is produced.' },
  { q: 'Can this open a PDF that needs a password just to view it?', a: 'No — if a PDF requires a password to even open in a viewer, that password is needed to decrypt it. This tool can\u2019t recover or bypass that password.' },
  { q: 'Is my PDF uploaded to a server?', a: 'No. Everything happens in your browser.' },
];

export default function UnlockPdfPage() {
  return (
    <>
      <Head>
        <title>Unlock PDF — ImageYantra</title>
        <meta name="description" content="Remove password protection from a PDF file." />
      </Head>
      <PageShell>
        <ToolShell
          title="Unlock"
          titleAccent="PDF"
          description="Remove owner-password restrictions (printing, copying, editing) from a PDF."
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
                note={result.rasterized ? 'This PDF was encrypted, so pages were rebuilt as high-quality images to reliably strip all restrictions.' : undefined}
                onReset={api.reset}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <UnlockWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function UnlockWorking({ file, api }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleUnlock() {
    setBusy(true);
    setError(null);
    try {
      const result = await unlockPdf(file);
      setBusy(false);
      api.goToResult({ ...result, originalSize: file.size, filename: file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf' });
    } catch (e) {
      reportToolError('unlock-pdf', e);
      setBusy(false);
      setError('This PDF requires a password to open, which we can\u2019t bypass. This tool only removes owner-password restrictions on files that already open without a password.');
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
            <LockOpen className="h-4 w-4 text-violet-600" /> Unlock PDF
          </div>
          <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Removes owner-password restrictions (print/copy/edit locks) from a PDF that already opens without a password.
          </div>
          {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
          <button
            type="button"
            onClick={handleUnlock}
            disabled={busy || !file}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Unlocking…' : <>Unlock PDF <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
