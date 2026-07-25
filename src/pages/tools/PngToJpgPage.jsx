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
  { slug: 'jpg-to-png',    name: 'JPG to PNG',    Icon: RefreshCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
];

const FAQS = [
  { q: 'Why convert PNG to JPG?', a: 'JPG files are usually much smaller than PNG for photographic images, which makes them faster to upload, email, and load on the web.' },
  { q: 'What happens to transparent areas?', a: 'JPG doesn\u2019t support transparency, so any transparent pixels in your PNG are filled with white in the output.' },
  { q: 'Is my image uploaded to a server?', a: 'No. Conversion happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.' },
];

export default function PngToJpgPage() {
  return (
    <>
      <Head>
        <title>PNG to JPG — ImageYantra</title>
        <meta name="description" content="Convert a PNG image into a smaller, widely-supported JPG file." />
      </Head>
      <PageShell>
        <ToolShell
          title="PNG to"
          titleAccent="JPG"
          description="Convert PNG images to JPG, right in your browser."
          accept="image/png"
          multiple={false}
          maxFiles={1}
          fileNoun="PNG"
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
              toolLabel="PNG to JPG"
              outExt="jpg"
              defaultQuality={0.92}
              note="Transparent areas will be filled with white \u2014 JPG doesn\u2019t support transparency."
              convert={(dataUrl, quality) => convertImageFormat(dataUrl, 'jpeg', quality)}
            />
          )}
        </ToolShell>
      </PageShell>
    </>
  );
}
