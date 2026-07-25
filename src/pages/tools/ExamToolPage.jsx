import { Head } from 'vite-react-ssg';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import ExamImageWorking from '../../components/tools/ExamImageWorking.jsx';
import ExamDocumentWorking from '../../components/tools/ExamDocumentWorking.jsx';
import ExamDocumentResult from '../../components/tools/ExamDocumentResult.jsx';
import ExamUtilityWorking from '../../components/tools/ExamUtilityWorking.jsx';
import { getExamToolSpec } from '../../data/examToolSpec.js';
import { FREEFORM_EXAM_TOOL_SLUGS, UTILITY_EXAM_TOOL_SLUGS } from '../../data/examToolBase.js';
import { downloadDataURL } from '../../utils/imageProcessing.js';
import { getRelatedExamTools } from '../../utils/helpers.js';
import { toolIcon } from '../../utils/toolIcons.js';
import { BLOG_POSTS } from '../../data/index.js';

const FREEFORM_ICON_KIND = {
  resizer: 'photo',
  sigresizer: 'signature',
  thumbresizer: 'thumb',
};

/** Exam blog posts first, then fill up to 3 with the rest. */
function getExamResultBlogs() {
  const examFirst = BLOG_POSTS.filter((b) => b.category === 'Exam');
  const rest = BLOG_POSTS.filter((b) => b.category !== 'Exam');
  return [...examFirst, ...rest].slice(0, 3);
}

function getExamResultFaqs(tool) {
  return [
    {
      q: `Will this ${tool.name} meet the official upload requirements?`,
      a: `Yes. The tool applies the exact dimensions, file size range and background specified by the authority for ${tool.name.replace(/ (Photo|Signature|Documents)$/, '')}, so the output is ready to upload directly.`,
    },
    {
      q: 'Is my photo or document uploaded to a server?',
      a: 'No. Processing happens entirely in your browser using the Canvas and File APIs — your files never leave your device.',
    },
    {
      q: 'What if my file is rejected by the application portal?',
      a: 'Double-check the portal\u2019s own size range — some exams update specs between cycles. You can re-run this tool with a custom target size using the freeform resizer if needed.',
    },
    {
      q: 'Can I use this on my phone?',
      a: 'Yes, every ImageYantra tool works on mobile browsers — no app install required.',
    },
  ];
}

export default function ExamToolPage({ tool }) {
  const isFreeform = FREEFORM_EXAM_TOOL_SLUGS.has(tool.slug);
  const isUtility = UTILITY_EXAM_TOOL_SLUGS.has(tool.slug);
  const isDocuments = tool.icon === 'documents';

  const spec = isFreeform
    ? { kind: FREEFORM_ICON_KIND[tool.icon] || 'photo', examName: null, dimsLabel: null, sizeLabel: null, dims: null, sizeRange: null, bg: 'White', format: 'JPG / JPEG', note: 'Set any width, height and target file size — handy for exams not listed by name.' }
    : getExamToolSpec(tool);

  const accept = isDocuments ? 'image/*,application/pdf' : 'image/*';
  const multiple = isDocuments;

  const relatedTools = getRelatedExamTools(tool).map((t) => ({ slug: t.slug, name: t.name, Icon: toolIcon(t.icon) }));
  const relatedBlogs = getExamResultBlogs();
  const faqs = getExamResultFaqs(tool);

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
          accept={accept}
          multiple={multiple}
          maxFiles={multiple ? 10 : 1}
          fileNoun={isDocuments ? 'FILE' : 'IMAGE'}
          renderResult={(results, api) =>
            isDocuments ? (
              <ExamDocumentResult items={results} onReset={api.reset}>
                <ToolResultExtras relatedTools={relatedTools} relatedBlogs={relatedBlogs} faqs={faqs} tone="exam" />
              </ExamDocumentResult>
            ) : (
              <>
                <ToolResult
                  items={results}
                  onReset={api.reset}
                  showDownloadAll={false}
                  onDownloadAll={() => results.forEach((r) => downloadDataURL(r.downloadUrl, r.name))}
                />
                <ToolResultExtras relatedTools={relatedTools} relatedBlogs={relatedBlogs} faqs={faqs} tone="exam" />
              </>
            )
          }
        >
          {(files, api) => {
            if (isUtility) return <ExamUtilityWorking tool={tool} file={files[0]} api={api} />;
            if (isDocuments) return <ExamDocumentWorking tool={tool} spec={spec} files={files} api={api} />;
            return <ExamImageWorking tool={tool} spec={spec} file={files[0]} api={api} allowCustomTarget={isFreeform} />;
          }}
        </ToolShell>
      </PageShell>
    </>
  );
}
