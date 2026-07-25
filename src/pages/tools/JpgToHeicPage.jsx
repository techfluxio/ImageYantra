import { Head } from 'vite-react-ssg';
import { RefreshCw, Minimize2, Scan, FlipHorizontal } from 'lucide-react';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import FormatConvertWorking from '../../components/tools/FormatConvertWorking.jsx';
import { convertImageFormat, downloadDataURL } from '../../utils/imageProcessing.js';
import { BLOG_POSTS } from '../../data/index.js';

const RELATED_TOOLS = [
  { slug: 'heic-to-jpg',   name: 'HEIC to JPG',   Icon: RefreshCw },
  { slug: 'jpg-to-webp',   name: 'JPG to WEBP',   Icon: RefreshCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
];

const FAQS = [
  { q: 'Why does this convert to WEBP instead of a real .heic file?', a: 'HEIC encoding relies on Apple\u2019s licensed HEVC video codec, and no web browser exposes a way to write real HEIC files from JavaScript \u2014 only to read/decode them. WEBP is the closest browser-native equivalent: similarly efficient compression with much broader support.' },
  { q: 'Will this file open on my iPhone as a Photo?', a: 'The output is a standard .webp image, not an Apple HEIC container, so it won\u2019t appear identical to a Camera-app HEIC \u2014 but it opens fine in any modern browser, and most photo apps.' },
  { q: 'Is my image uploaded to a server?', a: 'No. Conversion happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.' },
];

export default function JpgToHeicPage() {
  return (
    <>
      <Head>
        <title>JPG to HEIC — ImageYantra</title>
        <meta name="description" content="Convert JPG photos into an efficient, HEIC-equivalent format." />
      </Head>
      <PageShell>
        <ToolShell
          title="JPG to"
          titleAccent="HEIC"
          description="Browsers can't write real HEIC files, so we convert to WebP \u2014 the closest efficient, widely-supported equivalent."
          accept="image/jpeg"
          multiple={false}
          maxFiles={1}
          fileNoun="JPG"
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
          {(files, api) => (
            <FormatConvertWorking
              file={files[0]}
              api={api}
              toolLabel="JPG to HEIC"
              outExt="webp"
              defaultQuality={0.85}
              note="No web browser can encode real HEIC files \u2014 that requires Apple\u2019s licensed HEVC codec, which JavaScript can\u2019t access. We convert to WebP instead: similarly small file sizes with universal browser support."
              convert={(dataUrl, quality) => convertImageFormat(dataUrl, 'webp', quality)}
            />
          )}
        </ToolShell>
      </PageShell>
    </>
  );
}
