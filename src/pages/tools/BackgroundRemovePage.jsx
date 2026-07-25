import { useEffect, useState } from 'react';
import { Head } from 'vite-react-ssg';
import { ArrowRight, Eraser, Trash2, Scan, FlipHorizontal, Minimize2, Maximize2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import BgRemoveResult from '../../components/tools/BgRemoveResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import { dataURLSize, formatBytes, fileFormatLabel } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'resize-image',  name: 'Resize Image',  Icon: Maximize2 },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
];

const FAQS = [
  { q: 'How does background removal work here?', a: 'An on-device AI model (running fully in your browser via WebAssembly) segments the main subject from the background \u2014 no image is ever sent to a server.' },
  { q: 'Why did the first run take longer?', a: 'The AI model (a few dozen MB) is downloaded once and cached by your browser. Every run after that is much faster.' },
  { q: 'What file format is the result?', a: 'A transparent PNG, so the removed background stays see-through and the image can be placed over any new background.' },
  { q: 'Does this work well on any photo?', a: 'It works best with a clear, well-lit subject. Busy backgrounds, motion blur, or very low contrast between subject and background can reduce accuracy.' },
];

export default function BackgroundRemovePage() {
  return (
    <>
      <Head>
        <title>Background Remove — ImageYantra</title>
        <meta name="description" content="Remove any image background instantly with a clean transparent PNG output." />
      </Head>
      <PageShell>
        <ToolShell
          title="Background"
          titleAccent="REMOVE"
          description="Remove the background from any photo, entirely in your browser."
          accept="image/*"
          multiple={false}
          maxFiles={1}
          renderResult={(results, api) => (
            <>
              <BgRemoveResult item={results[0]} onReset={api.reset} />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="image" />
            </>
          )}
        >
          {(files, api) => <BgRemoveWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function BgRemoveWorking({ file, api }) {
  const [url, setUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [pct, setPct] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  async function handleRemove() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setStage('Removing background…');
    setPct(0);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(file, {
        // Pin the model/wasm assets to the exact version installed in
        // package.json — letting this default to "latest" is the most common
        // cause of silent failures when the CDN's latest build drifts out of
        // sync with the bundled JS API.
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
        model: 'medium', // higher quality cutout, closer to remove.bg
        output: { format: 'image/png', quality: 1 },
        progress: (key, current, total) => {
          setStage('Removing background…');
          setPct(total ? Math.round((current / total) * 100) : 0);
        },
      });
      const outUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setBusy(false);
      api.goToResult([{
        name: file.name.replace(/\.\w+$/, '') + '-no-bg.png',
        thumb: outUrl,
        originalSize: file.size,
        newSize: dataURLSize(outUrl),
        downloadUrl: outUrl,
      }]);
    } catch (e) {
      console.error('[BackgroundRemove] failed:', e);
      reportToolError('background-remove', e);
      setBusy(false);
      const detail = e && e.message ? ` (${e.message})` : '';
      setError(`Background removal failed for this image${detail}. Try a different photo, use a modern Chrome/Edge/Firefox browser, or check your connection (the AI model needs to download on first use).`);
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-sm font-semibold text-neutral-900">{file?.name}</div>
          <button
            type="button"
            onClick={api.removeAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
        {url && (
          <div
            className="mx-auto flex max-h-[520px] min-h-[320px] items-center justify-center overflow-hidden rounded-xl"
            style={{ backgroundImage: 'linear-gradient(45deg,#f1f1f4 25%,transparent 25%),linear-gradient(-45deg,#f1f1f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f1f4 75%),linear-gradient(-45deg,transparent 75%,#f1f1f4 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0,0 10px,10px -10px,-10px 0' }}
          >
            <img src={url} alt="preview" className="max-h-[520px] w-auto max-w-full object-contain" />
          </div>
        )}
        <div className="mt-3 text-center text-xs text-neutral-500">
          {formatBytes(file?.size)} · {fileFormatLabel(file)}
        </div>
      </div>

      <div className="w-full space-y-4 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Eraser className="h-4 w-4 text-violet-600" /> Background Remove
          </div>

          <div className="rounded-lg bg-violet-50 p-3 text-xs text-violet-800">
            Runs a compact AI segmentation model fully on-device to cut out your subject and give a transparent PNG. The model downloads once and is cached for next time.
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</div>
          )}

          {busy && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
                <span>{stage}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            disabled={busy || !file}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? (stage || 'Processing…') : <>Remove Background <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
