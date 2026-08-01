import { Head } from 'vite-react-ssg';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import ExamImageWorking from '../../components/tools/ExamImageWorking.jsx';
import { ID_PHOTO_SIZES } from '../../data/index.js';
import { downloadDataURL, parseDimsSpec, parseSizeSpec } from '../../utils/imageProcessing.js';
import { toolIcon } from '../../utils/toolIcons.js';
import { BLOG_POSTS } from '../../data/index.js';

/**
 * Builds the same `spec` shape ExamImageWorking expects, but sourced
 * directly from a ID_PHOTO_SIZES entry's own `specs` field instead of the
 * exams.js lookup table (there is no "exam" behind these — just a
 * fixed official document size).
 */
function buildGovtSpec(tool) {
  const kind = tool.icon === 'signature' ? 'signature' : 'photo';
  const dimsLabel = tool.specs?.dims || null;
  const sizeLabel = tool.specs?.size || null;
  return {
    kind,
    examName: null,
    dimsLabel,
    sizeLabel,
    dims: dimsLabel ? parseDimsSpec(dimsLabel) : null,
    sizeRange: sizeLabel ? parseSizeSpec(sizeLabel) : null,
    bg: tool.specs?.bg || (kind === 'photo' ? 'White' : null),
    format: tool.specs?.format || 'JPG / JPEG',
    note: kind === 'signature'
      ? 'Sign in black or blue ink on plain white paper, then scan or photograph it clearly before uploading.'
      : 'Face the camera directly with a plain white background, even lighting, and no shadows for best results.',
  };
}

function getRelatedGovtTools(tool, limit = 4) {
  return ID_PHOTO_SIZES.filter((t) => t.slug !== tool.slug).slice(0, limit);
}

function getGovtFaqs(tool) {
  const short = tool.name.replace(/ (Photo|Signature)$/, '');
  return [
    {
      q: `What size will my ${short.toLowerCase()} be?`,
      a: `The tool resizes your file to the exact official ${tool.specs?.dims || 'target'} dimensions and keeps the file size within ${tool.specs?.size || 'the required range'}, so it's ready to upload directly.`,
    },
    {
      q: 'Is my photo uploaded to a server?',
      a: 'No. Processing happens entirely in your browser using the Canvas and File APIs — your file never leaves your device.',
    },
    {
      q: 'What if the portal rejects my file?',
      a: 'Some departments update their size requirements from time to time — double check the portal\u2019s own instructions if that happens, then re-run the tool with adjusted settings if needed.',
    },
    {
      q: 'Can I use this on my phone?',
      a: 'Yes, every ImageYantra tool works on mobile browsers — no app install required.',
    },
  ];
}

export default function GovtToolPage({ tool }) {
  const spec = buildGovtSpec(tool);
  const relatedTools = getRelatedGovtTools(tool).map((t) => ({ slug: t.slug, name: t.name, Icon: toolIcon(t.icon) }));
  const faqs = getGovtFaqs(tool);

  return (
    <>
      <Head>
        <title>{tool.name} — ImageYantra</title>
        <meta name="description" content={tool.desc} />
      </Head>
      <PageShell>
        <ToolShell
          title={tool.name}
          description={tool.desc}
          accept="image/*"
          multiple={false}
          maxFiles={1}
          fileNoun="IMAGE"
          renderResult={(results, api) => (
            <>
              <ToolResult
                items={results}
                onReset={api.reset}
                showDownloadAll={false}
                onDownloadAll={() => results.forEach((r) => downloadDataURL(r.downloadUrl, r.name))}
              />
              <ToolResultExtras relatedTools={relatedTools} relatedBlogs={BLOG_POSTS.slice(0, 3)} faqs={faqs} tone="govt" />
            </>
          )}
        >
          {(files, api) => <ExamImageWorking tool={tool} spec={spec} file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}
