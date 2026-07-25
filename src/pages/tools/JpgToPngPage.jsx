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
  { slug: 'png-to-jpg',    name: 'PNG to JPG',    Icon: RefreshCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
];

const FAQS = [
  { q: 'Why convert JPG to PNG?', a: 'PNG is lossless and supports transparency, which makes it better suited for logos, icons, screenshots, and graphics with sharp text or edges than JPG.' },
  { q: 'Will the file get bigger?', a: 'Usually, yes. PNG\u2019s lossless compression tends to produce larger files than JPG for photographic images, though it preserves every pixel exactly.' },
  { q: 'Is my image uploaded to a server?', a: 'No. Conversion happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.' },
];

export default function JpgToPngPage() {
  return (
    <>
      <Head>
        <title>JPG to PNG — ImageYantra</title>
        <meta name="description" content="Convert a JPG image to lossless, transparency-ready PNG." />
      </Head>
      <PageShell>
        <ToolShell
          title="JPG to"
          titleAccent="PNG"
          description="Convert JPG images to lossless PNG, right in your browser."
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
              toolLabel="JPG to PNG"
              outExt="png"
              allowQuality={false}
              note="PNG is lossless and supports transparency \u2014 ideal for logos, screenshots, and sharp-edged graphics."
              convert={(dataUrl) => convertImageFormat(dataUrl, 'png')}
            />
          )}
        </ToolShell>
      </PageShell>
    </>
  );
}
