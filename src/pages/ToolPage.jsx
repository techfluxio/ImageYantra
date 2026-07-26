import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import PageShell from '../components/layout/PageShell.jsx';
import PageLoader from '../components/layout/PageLoader.jsx';
import GenericSelectFilePage from './tools/GenericSelectFilePage.jsx';
import ExamToolPage from './tools/ExamToolPage.jsx';
import GovtToolPage from './tools/GovtToolPage.jsx';
import SocialToolPage from './tools/SocialToolPage.jsx';
import OtherToolPage from './tools/OtherToolPage.jsx';
import { IMAGE_TOOLS } from '../data/imageTools.js';
import { PDF_TOOLS } from '../data/pdfTools.js';
import { GOVT_TOOLS } from '../data/index.js';
import { SOCIAL_TOOLS } from '../data/socialTools.js';
import { OTHER_TOOLS } from '../data/otherTools.js';
import { EXAM_TOOLS } from '../data/examTools.js';
import { fetchLiveTools } from '../utils/publicApi.js';
import liveContent from '../data/generated/live.json';

/**
 * Auto-discovery: every .jsx file dropped into src/pages/tools/ is
 * bundled here automatically — no hand-written import needed. This is
 * what makes the admin panel's "upload tool code" feature work: once a
 * new file lands in this folder (via the GitHub-commit-and-rebuild flow)
 * and the build runs, it's picked up here with zero manual wiring.
 *
 * IMPORTANT — two different modes on purpose:
 *   - During the SSG build (`import.meta.env.SSR` is true, Vite replaces
 *     this with a literal at build time and tree-shakes the other
 *     branch), imports are EAGER, so the prerendered static HTML
 *     contains each tool's real, full content.
 *   - In the actual browser bundle, imports are LAZY (React.lazy +
 *     Suspense), so a tool's code — and its heavy dependencies like
 *     heic2any, jsPDF, the background-removal ONNX runtime, and
 *     html2canvas — only downloads when someone actually opens that tool,
 *     instead of bloating every page's initial bundle.
 *   Using lazy() during the SSG pass too would make the prerendered HTML
 *   show only the Suspense fallback (a loading spinner) instead of the
 *   real tool UI, which then causes a hydration mismatch the moment the
 *   client swaps in the real content — exactly the React error #418/#422
 *   pattern. Splitting the two modes like this avoids that entirely
 *   while keeping the bundle-size win.
 */
const toolModuleLoaders = import.meta.env.SSR
  ? import.meta.glob('./tools/*.jsx', { eager: true })
  : import.meta.glob('./tools/*.jsx');

// Cache resolved/lazy components per file so re-renders don't create a
// new component reference (which would remount and re-fetch on every render).
const componentCache = new Map();

function componentFromFile(fileName) {
  const key = `./tools/${fileName}`;
  const loader = toolModuleLoaders[key];
  if (!loader) return null;
  if (!componentCache.has(key)) {
    componentCache.set(key, import.meta.env.SSR ? (loader.default || null) : lazy(loader));
  }
  return componentCache.get(key);
}

/* Tools with a fully custom, hand-built interface that predate the
   admin panel — mapped explicitly here since their filenames don't
   follow a single predictable naming convention (e.g. "10KB" cases).
   Anything added *through the admin panel* going forward doesn't need
   an entry here: its filename is looked up directly via the `tools`
   table's `component_path` column instead (see ALL_TOOLS/lookup below). */
const LEGACY_SLUG_TO_FILE = {
  'compress-image': 'CompressImagePage.jsx',
  'crop-image': 'CropImagePage.jsx',
  'flip-image': 'FlipImagePage.jsx',
  'rotate-image': 'RotateImagePage.jsx',
  'resize-image': 'ResizeImagePage.jsx',
  'jpg-to-png': 'JpgToPngPage.jsx',
  'png-to-jpg': 'PngToJpgPage.jsx',
  'webp-to-jpg': 'WebpToJpgPage.jsx',
  'jpg-to-webp': 'JpgToWebpPage.jsx',
  'heic-to-jpg': 'HeicToJpgPage.jsx',
  'jpg-to-heic': 'JpgToHeicPage.jsx',
  'compress-under-10kb': 'CompressUnder10KBPage.jsx',
  'compress-under-50kb': 'CompressUnder50KBPage.jsx',
  'background-remove': 'BackgroundRemovePage.jsx',
  'merge-pdf': 'MergePdfPage.jsx',
  'arrange-pdf': 'ArrangePdfPage.jsx',
  'remove-pages': 'RemovePagesPage.jsx',
  'extract-pages': 'ExtractPagesPage.jsx',
  'split-pdf': 'SplitPdfPage.jsx',
  'remove-blank-pages': 'RemoveBlankPagesPage.jsx',
  'compress-pdf': 'CompressPdfPage.jsx',
  'compress-under-100kb': 'CompressPdfUnder100KBPage.jsx',
  'compress-under-500kb': 'CompressPdfUnder500KBPage.jsx',
  'jpg-to-pdf': 'JpgToPdfPage.jsx',
  'png-to-pdf': 'PngToPdfPage.jsx',
  'pdf-to-jpg': 'PdfToJpgPage.jsx',
  'unlock-pdf': 'UnlockPdfPage.jsx',
  'encrypt-pdf': 'EncryptPdfPage.jsx',
  'html-to-pdf': 'HtmlToPdfPage.jsx',
};

/* PDF tools whose input is actually an image, not a PDF. */
const PDF_IMAGE_INPUT_SLUGS = new Set(['jpg-to-pdf', 'png-to-pdf']);
/* PDF tools whose input is an HTML file, not a PDF. */
const PDF_HTML_INPUT_SLUGS = new Set(['html-to-pdf']);
/* Image tools that only ever act on one image at a time and don't have
   a fully built page yet — these still get the larger single-image
   preview instead of the batch thumbnail grid. */
const SINGLE_FILE_IMAGE_SLUGS = new Set(['background-remove']);

function withSource(tools, source) {
  return tools.map((t) => ({ ...t, _source: source }));
}

const STATIC_ALL_TOOLS = [
  ...withSource(IMAGE_TOOLS, 'image'),
  ...withSource(PDF_TOOLS, 'pdf'),
  ...withSource(GOVT_TOOLS, 'govt'),
  ...withSource(SOCIAL_TOOLS, 'social'),
  ...withSource(OTHER_TOOLS, 'other'),
  ...withSource(EXAM_TOOLS, 'exam'),
];

/** Work out sensible dropzone settings (accept type, multiple, label) for a tool. */
function selectFileConfig(meta) {
  switch (meta._source) {
    case 'pdf':
      if (PDF_IMAGE_INPUT_SLUGS.has(meta.slug)) {
        return { accept: 'image/*', multiple: true, fileNoun: 'IMAGE' };
      }
      if (PDF_HTML_INPUT_SLUGS.has(meta.slug)) {
        return { accept: '.html,.htm', multiple: false, fileNoun: 'HTML FILE' };
      }
      return { accept: 'application/pdf', multiple: meta.slug === 'merge-pdf', fileNoun: 'PDF' };
    case 'image':
      return {
        accept: 'image/*',
        multiple: !SINGLE_FILE_IMAGE_SLUGS.has(meta.slug),
        fileNoun: 'IMAGE',
      };
    case 'govt':
    case 'social':
      return { accept: 'image/*', multiple: false, fileNoun: 'IMAGE' };
    case 'exam':
      if (meta.icon === 'documents') {
        return { accept: 'image/*,application/pdf', multiple: true, fileNoun: 'FILE' };
      }
      return { accept: 'image/*', multiple: false, fileNoun: 'IMAGE' };
    default:
      return null; // not a file-based tool (e.g. Other Tools text/data utilities)
  }
}

export default function ToolPage() {
  const { slug } = useParams();

  // Admin-added tools: build-time snapshot immediately (so SSG output
  // already has them), refined by a live fetch once the page mounts so a
  // tool created seconds ago also just works without waiting for a rebuild
  // to reach *this* particular page (the rebuild is still what makes its
  // *code* live — see the note in the "tool not found yet" state below).
  const [liveTools, setLiveTools] = useState(liveContent.tools || []);
  useEffect(() => {
    fetchLiveTools().then((t) => { if (t) setLiveTools(t); });
  }, []);

  // 1. A legacy hand-built tool?
  const legacyFile = LEGACY_SLUG_TO_FILE[slug];
  const LegacyComponent = legacyFile ? componentFromFile(legacyFile) : null;
  if (LegacyComponent) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LegacyComponent />
      </Suspense>
    );
  }

  // 2. An admin-uploaded tool whose code has been committed & bundled?
  const liveTool = liveTools.find((t) => t.slug === slug);
  if (liveTool?.component_path) {
    const UploadedComponent = componentFromFile(liveTool.component_path);
    if (UploadedComponent) {
      return (
        <Suspense fallback={<PageLoader />}>
          <UploadedComponent />
        </Suspense>
      );
    }
    // Row exists but the file hasn't reached this build yet — the GitHub
    // commit succeeded but the rebuild triggered by it hasn't finished
    // (or hasn't run at all). Tell the visitor plainly rather than 404.
    return (
      <PageShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="text-2xl font-extrabold text-neutral-900">{liveTool.name} is on its way</h1>
          <p className="mt-2 text-neutral-500">This tool was just added and is being built — check back in a few minutes.</p>
        </div>
      </PageShell>
    );
  }

  const meta = STATIC_ALL_TOOLS.find((t) => t.slug === slug);

  if (meta && meta._source === 'exam') {
    return <ExamToolPage tool={meta} />;
  }
  if (meta && meta._source === 'govt') {
    return <GovtToolPage tool={meta} />;
  }
  if (meta && meta._source === 'social') {
    return <SocialToolPage tool={meta} />;
  }
  if (meta && meta._source === 'other') {
    return <OtherToolPage tool={meta} />;
  }

  const config = meta ? selectFileConfig(meta) : null;

  if (meta && config) {
    return (
      <GenericSelectFilePage
        name={meta.name}
        desc={meta.desc}
        accept={config.accept}
        multiple={config.multiple}
        fileNoun={config.fileNoun}
        workspaceLayout={meta._source === 'image'}
      />
    );
  }

  // Tool not found, or a non-file-based tool (Other Tools) not built yet.
  return (
    <>
      <Head>
        <title>{meta ? `${meta.name} — ImageYantra` : 'Tool — ImageYantra'}</title>
      </Head>
      <PageShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="text-2xl font-extrabold text-neutral-900">
            {meta ? meta.name : 'This tool'} is being rebuilt
          </h1>
          <p className="mt-2 text-neutral-500">
            {meta?.desc || "This page hasn't been designed yet."} Check back soon.
          </p>
          <Link to="/" className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            Back to Home
          </Link>
        </div>
      </PageShell>
    </>
  );
}