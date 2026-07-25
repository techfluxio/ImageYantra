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
  { slug: 'webp-to-jpg',   name: 'WEBP to JPG',   Icon: RefreshCw },
  { slug: 'compress-image',name: 'Compress Image',Icon: Minimize2 },
  { slug: 'crop-image',    name: 'Crop Image',    Icon: Scan },
  { slug: 'flip-image',    name: 'Flip Image',    Icon: FlipHorizontal },
];

const FAQS = [
  { q: 'Why convert JPG to WEBP?', a: 'WEBP typically produces noticeably smaller files than JPG at the same visual quality, which helps pages load faster.' },
  { q: 'Is WEBP supported everywhere?', a: 'All modern browsers support WEBP. A small number of older apps and devices may not, so keep the JPG if you need maximum compatibility.' },
  { q: 'Is my image uploaded to a server?', a: 'No. Conversion happens entirely in your browser using the Canvas API \u2014 your file never leaves your device.' },
];

export default function JpgToWebpPage() {
  return (
    <>
      <Head>
        <title>JPG to WEBP — ImageYantra</title>
        <meta name="description" content="Convert JPG images into the smaller, modern WEBP format." />
      </Head>
      <PageShell>
        <ToolShell
          title="JPG to"
          titleAccent="WEBP"
          description="Convert JPG images to WEBP, right in your browser."
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
              toolLabel="JPG to WEBP"
              outExt="webp"
              defaultQuality={0.85}
              note="WEBP keeps similar visual quality to JPG at a smaller file size."
              convert={(dataUrl, quality) => convertImageFormat(dataUrl, 'webp', quality)}
            />
          )}
        </ToolShell>
      </PageShell>
    </>
  );
}
