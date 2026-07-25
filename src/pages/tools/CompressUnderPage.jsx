import { useState } from 'react';
import { Head } from 'vite-react-ssg';
import { Plus, Trash2, SlidersHorizontal, ArrowRight, Scan, FlipHorizontal, RotateCw, Maximize2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import FileThumb from '../../components/tools/FileThumb.jsx';
import { readFileAsDataURL, compressToTarget, downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'compress-image',name: 'Compress Image', Icon: Maximize2 },
  { slug: 'resize-image',  name: 'Resize Image',   Icon: Scan },
  { slug: 'crop-image',    name: 'Crop Image',     Icon: FlipHorizontal },
  { slug: 'rotate-image',  name: 'Rotate Image',   Icon: RotateCw },
];

function downloadNow(item) {
  downloadDataURL(item.downloadUrl, item.name);
}

/** Shared implementation behind /tools/compress-under-10kb and /tools/compress-under-50kb.
 * @param {number} targetKB   the advertised ceiling (e.g. 10 or 50)
 * @param {[number,number]} [bandKB]  exact output range in KB, e.g. [9, 9.5] or [48, 49].
 *   Defaults to the top 10% of the ceiling if not given.
 */
export function makeCompressUnderPage({ targetKB, slug, bandKB }) {
  const label = `${targetKB}KB`;
  const [bandMinKB, bandMaxKB] = bandKB || [targetKB * 0.9, targetKB * 0.98];
  const faqs = [
    { q: `Will my photo definitely end up under ${label}?`, a: `Yes \u2014 the tool searches quality and, if needed, dimensions until the output fits at or under ${label}, which is the typical exam/form upload limit.` },
    { q: 'Will this hurt photo quality?', a: `Compressing to ${label} is fairly aggressive for a full-resolution photo, so some quality loss is expected \u2014 the tool always picks the best quality that still fits the limit.` },
    { q: 'Is my photo uploaded to a server?', a: 'No. Compression happens entirely in your browser using the Canvas API \u2014 your files never leave your device.' },
  ];

  return function CompressUnderPage() {
    return (
      <>
        <Head>
          <title>Compress Image under {label} — ImageYantra</title>
          <meta name="description" content={`Compress a photo to under ${label} for strict exam or form upload limits.`} />
        </Head>
        <PageShell>
          <ToolShell
            title={`Compress under`}
            titleAccent={label}
            description={`Automatically compress your photo to fit under ${label} \u2014 perfect for exam and government form uploads.`}
            accept="image/*"
            multiple
            maxFiles={10}
            renderResult={(results, api) => (
              <>
                <ToolResult items={results} onReset={api.reset} onDownloadAll={() => results.forEach((r) => downloadNow(r))} />
                <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={faqs} tone="image" />
              </>
            )}
          >
            {(files, api) => (
              <CompressUnderWorking
                files={files}
                api={api}
                targetKB={targetKB}
                bandMinKB={bandMinKB}
                bandMaxKB={bandMaxKB}
                label={label}
                slug={slug}
              />
            )}
          </ToolShell>
        </PageShell>
      </>
    );
  };
}

function CompressUnderWorking({ files, api, targetKB, bandMinKB, bandMaxKB, label }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });

  async function handleCompress() {
    setBusy(true);
    // Hard ceiling is the band max (comfortably below the advertised limit),
    // so the result always lands inside [bandMinKB, bandMaxKB] and never
    // even brushes the true targetKB limit.
    const hardCapBytes = Math.round(bandMaxKB * 1024);
    const softFloorBytes = Math.round(bandMinKB * 1024);
    const results = [];
    for (const file of files) {
      const dataUrl = await readFileAsDataURL(file);
      const origBytes = file.size;
      const { dataUrl: outUrl, finalSize } = await compressToTarget(
        { dataUrl, origBytes },
        hardCapBytes,
        (pct, msg) => setProgress({ pct, msg }),
        { minBytes: softFloorBytes },
      );
      results.push({
        name: file.name.replace(/\.\w+$/, '') + `-under-${label}.jpg`,
        thumb: dataUrl,
        originalSize: origBytes,
        newSize: finalSize,
        downloadUrl: outUrl,
      });
    }
    setBusy(false);
    api.goToResult(results);
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
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" /> Compression Target
          </div>

          <div className="rounded-lg border-2 border-violet-500 bg-violet-50 p-4 text-center">
            <div className="text-2xl font-extrabold text-violet-700">{label}</div>
            <div className="mt-0.5 text-xs text-violet-600">
              lands between {bandMinKB}KB–{bandMaxKB}KB
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
            Each image is compressed independently to land between <strong>{bandMinKB}KB and {bandMaxKB}KB</strong> — comfortably under the {label} limit — keeping the best possible quality.
          </div>

          <button
            type="button"
            onClick={handleCompress}
            disabled={busy || files.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (progress.msg || 'Compressing…') : <>Compress under {label} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
