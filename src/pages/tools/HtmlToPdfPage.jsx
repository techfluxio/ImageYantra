import { useState } from 'react';
import { reportToolError } from '../../utils/errorReporting.js';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Trash2, FileCode } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import { capPdfUnder500KB } from '../../utils/pdfProcessing.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'merge-pdf',    name: 'Merge PDF',    Icon: iconForSlug('merge-pdf', PDF_TOOLS) },
  { slug: 'compress-pdf', name: 'Compress PDF', Icon: iconForSlug('compress-pdf', PDF_TOOLS) },
];

const FAQS = [
  { q: 'Will this keep my page\u2019s exact design and CSS?', a: 'No — this converts the readable text content of the HTML file into a clean, paginated PDF. Custom CSS layout, colors, and images aren\u2019t preserved. For a pixel-perfect copy of a live web page, use your browser\u2019s own Print to PDF.' },
  { q: 'What HTML can I upload?', a: 'Any .html or .htm file. Headings and paragraphs are detected and formatted; everything else is treated as plain text.' },
  { q: 'Is my file uploaded to a server?', a: 'No. Conversion happens entirely in your browser.' },
];

export default function HtmlToPdfPage() {
  return (
    <>
      <Head>
        <title>HTML to PDF — ImageYantra</title>
        <meta name="description" content="Convert an HTML file's content into a clean PDF." />
      </Head>
      <PageShell>
        <ToolShell
          title="HTML to"
          titleAccent="PDF"
          description="Convert an HTML file's text content into a clean, paginated PDF."
          accept=".html,.htm"
          multiple={false}
          maxFiles={1}
          fileNoun="HTML FILE"
          renderResult={(result, api) => (
            <>
              <PdfResult blob={result.blob} filename={result.filename} onReset={api.reset} />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="pdf" />
            </>
          )}
        >
          {(files, api) => <HtmlToPdfWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function HtmlToPdfWorking({ file, api }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleConvert() {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      doc.querySelectorAll('script, style').forEach((n) => n.remove());

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 48, marginTop = 56, marginBottom = 56;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - marginX * 2;
      let y = marginTop;

      function ensureSpace(lineHeight) {
        if (y + lineHeight > pageHeight - marginBottom) {
          pdf.addPage();
          y = marginTop;
        }
      }

      function writeBlock(str, { size = 11, bold = false, gapAfter = 10 } = {}) {
        const clean = str.replace(/\s+/g, ' ').trim();
        if (!clean) return;
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        const lineHeight = size * 1.35;
        const lines = pdf.splitTextToSize(clean, usableWidth);
        for (const line of lines) {
          ensureSpace(lineHeight);
          pdf.text(line, marginX, y);
          y += lineHeight;
        }
        y += gapAfter;
      }

      const title = doc.querySelector('title')?.textContent?.trim();
      if (title) writeBlock(title, { size: 18, bold: true, gapAfter: 16 });

      const blockNodes = doc.body
        ? doc.body.querySelectorAll('h1, h2, h3, h4, p, li, blockquote')
        : [];

      if (blockNodes.length === 0) {
        writeBlock(doc.body?.textContent || text, { size: 11 });
      } else {
        blockNodes.forEach((node) => {
          const tag = node.tagName.toLowerCase();
          const txt = node.textContent || '';
          if (!txt.trim()) return;
          if (tag === 'h1') writeBlock(txt, { size: 16, bold: true, gapAfter: 12 });
          else if (tag === 'h2') writeBlock(txt, { size: 14, bold: true, gapAfter: 10 });
          else if (tag === 'h3' || tag === 'h4') writeBlock(txt, { size: 12.5, bold: true, gapAfter: 8 });
          else if (tag === 'li') writeBlock(`•  ${txt}`, { size: 11, gapAfter: 4 });
          else writeBlock(txt, { size: 11, gapAfter: 8 });
        });
      }

      const blob = pdf.output('blob');
      const capped = await capPdfUnder500KB(blob);
      setBusy(false);
      api.goToResult({ blob: capped.blob, filename: file.name.replace(/\.html?$/i, '') + '.pdf' });
    } catch (e) {
      reportToolError('html-to-pdf', e);
      setBusy(false);
      setError('Could not read this HTML file. Make sure it\u2019s a valid .html/.htm file.');
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-500">
              <FileCode className="h-4 w-4" />
            </div>
            <div className="min-w-0 truncate text-sm font-semibold text-neutral-900">{file?.name}</div>
          </div>
          <button
            type="button"
            onClick={api.removeAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>

        <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
          Extracts headings, paragraphs and list items from the HTML and lays them out in a clean, paginated PDF.
        </div>
        {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

        <button
          type="button"
          onClick={handleConvert}
          disabled={busy || !file}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {busy ? 'Converting…' : <>Convert to PDF <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}
