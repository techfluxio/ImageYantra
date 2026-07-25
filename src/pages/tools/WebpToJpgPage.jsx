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
  { slug: 'jpg-to-webp',   name: 'JPG to WEBP',   Icon: RefreshCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
];

const FAQS = [
  { q: 'Why convert WEBP to JPG?', a: 'JPG is supported absolutely everywhere \u2014 every browser, app, and device \u2014 while some older software still doesn\u2019t recognize modern WEBP files.' },
  { q: 'Will I lose quality?', a: 'There\u2019s a small amount of re-compression since both formats are lossy, but at a high quality setting the difference is generally not visible.' },
  { q: 'Is my image uploaded to a server?', a: 'No. Conversion happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.' },
];

export default function WebpToJpgPage() {
  return (
    <>
      <Head>
        <title>WEBP to JPG — ImageYantra</title>
        <meta name="description" content="Convert a modern WEBP image into universally compatible JPG." />
      </Head>
      <PageShell>
        <ToolShell
          title="WEBP to"
          titleAccent="JPG"
          description="Convert WEBP images to JPG, right in your browser."
          accept="image/webp"
          multiple={false}
          maxFiles={1}
          fileNoun="WEBP"
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
              toolLabel="WEBP to JPG"
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
