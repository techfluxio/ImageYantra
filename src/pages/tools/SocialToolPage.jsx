import { Head } from 'vite-react-ssg';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import ToolResult from '../../components/tools/ToolResult.jsx';
import ToolResultExtras from '../../components/tools/ToolResultExtras.jsx';
import SocialImageWorking from '../../components/tools/SocialImageWorking.jsx';
import { parseDimsSpec, downloadDataURL } from '../../utils/imageProcessing.js';
import { getRelatedSocialTools } from '../../utils/helpers.js';
import { toolIcon } from '../../utils/toolIcons.js';
import { BLOG_POSTS } from '../../data/index.js';

const SOCIAL_RESULT_BLOGS = BLOG_POSTS.filter((b) => ['resize-image-guide', 'rotate-flip-guide', 'compress-image-guide'].includes(b.slug));

function getSocialResultFaqs(tool) {
  return [
    {
      q: `What size does the ${tool.name} tool export?`,
      a: `Your image is resized to ${tool.dims}, the exact size the platform expects, so it displays without any unwanted cropping or stretching.`,
    },
    {
      q: 'Will the image lose quality?',
      a: 'The tool resizes using high-quality canvas scaling and keeps compression light, so there\u2019s no visible quality loss for typical photos.',
    },
    {
      q: 'Is my image uploaded to a server?',
      a: 'No. Resizing happens entirely in your browser — your files never leave your device.',
    },
    {
      q: 'Can I resize for a different platform afterwards?',
      a: 'Yes — use Start Again, or pick another platform from Related Tools below, and upload the same image.',
    },
  ];
}

export default function SocialToolPage({ tool }) {
  const dims = parseDimsSpec(tool.dims);
  const relatedTools = getRelatedSocialTools(tool).map((t) => ({ slug: t.slug, name: t.name, Icon: toolIcon(t.icon) }));
  const faqs = getSocialResultFaqs(tool);

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
              <ToolResultExtras relatedTools={relatedTools} relatedBlogs={SOCIAL_RESULT_BLOGS} faqs={faqs} tone="social" />
            </>
          )}
        >
          {(files, api) => <SocialImageWorking tool={tool} dims={dims} file={files[0]} api={api} />}
        </ToolShell>
      </PageShell>
    </>
  );
}
