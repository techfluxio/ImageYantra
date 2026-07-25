import { useEffect, useState } from 'react';
import { reportToolError } from '../../utils/errorReporting.js';
import { Head } from 'vite-react-ssg';
import { RefreshCw, Minimize2, Scan, FlipHorizontal, Loader2 } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import FormatConvertWorking from '../../components/tools/FormatConvertWorking.jsx';
import { convertImageFormat, downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'jpg-to-heic',   name: 'JPG to HEIC',   Icon: RefreshCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
];

const FAQS = [
  { q: 'Why do iPhone photos need converting?', a: 'iPhones save photos as HEIC by default. It\u2019s an efficient format, but many Windows apps, websites, and older devices can\u2019t open it \u2014 JPG works everywhere.' },
  { q: 'Does converting lose photo quality?', a: 'HEIC and JPG are both compressed formats, so there\u2019s a small amount of re-encoding, but at a high quality setting it\u2019s not noticeable.' },
  { q: 'Is my photo uploaded to a server?', a: 'No. Decoding and conversion both happen entirely in your browser \u2014 your file never leaves your device.' },
];

export default function HeicToJpgPage() {
  return (
    <>
      <Head>
        <title>HEIC to JPG — ImageYantra</title>
        <meta name="description" content="Open iPhone HEIC photos as standard JPG on any device." />
      </Head>
      <PageShell>
        <ToolShell
          title="HEIC to"
          titleAccent="JPG"
          description="Convert iPhone HEIC photos to universally-supported JPG."
          accept=".heic,.heif,image/heic,image/heif"
          multiple={false}
          maxFiles={1}
          fileNoun="HEIC"
          renderResult={(results, api) => (
            <>
              <ToolResult
                items={results}
                onReset={api.reset}
                showDownloadAll={false}
                onDownloadAll={() => results.forEach((r) => downloadDataURL(r.downloadUrl, r.name))}
              />
              <ToolResultExtras relatedTools={RELATED_TOOLS} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={FAQS} tone="image" />
            </>
          )}
        >
          {(files, api) => <HeicWorking file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}

function HeicWorking({ file, api }) {
  const [decodedUrl, setDecodedUrl] = useState(null);
  const [error, setError] = useState(null);
  const [decoding, setDecoding] = useState(true);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setDecoding(true);
    setError(null);
    setDecodedUrl(null);
    (async () => {
      try {
        const heic2any = (await import('heic2any')).default;
        const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        const blob = Array.isArray(out) ? out[0] : out;
        const reader = new FileReader();
        reader.onload = () => { if (!cancelled) { setDecodedUrl(reader.result); setDecoding(false); } };
        reader.onerror = () => { if (!cancelled) { setError('Couldn\u2019t decode this HEIC file.'); setDecoding(false); } };
        reader.readAsDataURL(blob);
      } catch (e) {
        if (!cancelled) { reportToolError('heic-to-jpg', e); setError('Couldn\u2019t decode this HEIC file. Some HEIC variants (e.g. burst photos) aren\u2019t supported.'); setDecoding(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  if (decoding) {
    return (
      <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        <div className="text-sm">Decoding HEIC file…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center text-rose-600">
        <div className="text-sm font-medium">{error}</div>
        <button type="button" onClick={api.removeAll} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium hover:bg-rose-100">
          Try another file
        </button>
      </div>
    );
  }

  return (
    <FormatConvertWorking
      file={file}
      api={api}
      toolLabel="HEIC to JPG"
      outExt="jpg"
      defaultQuality={0.92}
      previewUrl={decodedUrl}
      note="Your HEIC photo has been decoded in-browser and is ready to convert."
      convert={(dataUrl, quality) => convertImageFormat(dataUrl, 'jpeg', quality)}
    />
  );
}
