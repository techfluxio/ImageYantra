import { useState } from 'react';
import { Head } from 'vite-react-ssg';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { iconForSlug } from '../../utils/toolIcons.js';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import PdfResult from '../../components/tools/PdfResult.jsx';
import FileThumb from '../../components/tools/FileThumb.jsx';
import PdfPageSettings from '../../components/tools/PdfPageSettings.jsx';
import { imagesToPdf } from '../../utils/pdfProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'merge-pdf',   name: 'Merge PDF',   Icon: iconForSlug('merge-pdf', PDF_TOOLS) },
  { slug: 'split-pdf',   name: 'Split PDF',   Icon: iconForSlug('split-pdf', PDF_TOOLS) },
  { slug: 'arrange-pdf', name: 'Arrange PDF', Icon: iconForSlug('arrange-pdf', PDF_TOOLS) },
];

export function makeImagesToPdfPage({ format }) {
  const label = format.toUpperCase();
  const faqs = [
    { q: 'Does converting to PDF reduce image quality?', a: 'No — each image is embedded into the PDF exactly as-is, at full resolution.' },
    { q: 'Can I add multiple images?', a: 'Yes — each image becomes its own page, in the order you added them.' },
    { q: 'Can I control page size, orientation, or margins?', a: 'Yes — choose Portrait or Landscape, pick a standard paper size (or keep the page fitted to each image), and add no, small, or big margins before converting.' },
    { q: 'Is my image uploaded to a server?', a: 'No. Conversion happens entirely in your browser.' },
  ];

  return function ImagesToPdfPageInner() {
    return (
      <>
        <Head>
          <title>{label} to PDF — ImageYantra</title>
          <meta name="description" content={`Convert ${label} images into a single PDF document.`} />
        </Head>
        <PageShell>
          <ToolShell
            title={`${label} to`}
            titleAccent="PDF"
            description={`Convert your ${label} images into a single PDF document.`}
            accept="image/*"
            multiple
            maxFiles={20}
            fileNoun="IMAGE"
            renderResult={(result, api) => (
              <>
                <PdfResult blob={result.blob} filename={result.filename} onReset={api.reset} />
                <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={faqs} tone="pdf" />
              </>
            )}
          >
            {(files, api) => <ImagesToPdfWorking files={files} api={api} />}
          </ToolShell>
        </PageShell>
      </>
    );
  };
}

function ImagesToPdfWorking({ files, api }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });
  const [settings, setSettings] = useState({ pageSize: 'a4', orientation: 'portrait', margin: 'none' });

  function updateSettings(next) {
    setSettings((prev) => ({ ...prev, ...next }));
  }

  async function handleConvert() {
    setBusy(true);
    const result = await imagesToPdf(files, (pct, msg) => setProgress({ pct, msg }), settings);
    setBusy(false);
    api.goToResult({ ...result, filename: (files[0].name.replace(/\.\w+$/, '') || 'images') + '.pdf' });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">
            Selected Images: <span className="text-violet-600">{String(files.length).padStart(2, '0')}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={api.addMore} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
              <Plus className="h-3.5 w-3.5" /> Add More
            </button>
            <button type="button" onClick={api.removeAll} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
              <Trash2 className="h-3.5 w-3.5" /> Remove All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {files.map((f, i) => (
            <FileThumb key={i} file={f} onRemove={() => api.removeOne(i)} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <PdfPageSettings value={settings} onChange={updateSettings} />
          <div className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Each image becomes one page, at full original quality, in the order shown.
          </div>
          <button
            type="button"
            onClick={handleConvert}
            disabled={busy || files.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Converting…') : <>Convert to PDF <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}