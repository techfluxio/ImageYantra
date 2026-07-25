import { Head } from 'vite-react-ssg';
import PageShell from '../../components/layout/PageShell.jsx';
import OtherToolLayout from '../../components/tools/other/OtherToolLayout.jsx';
import QrCodeGeneratorWorking from '../../components/tools/other/QrCodeGeneratorWorking.jsx';
import BarcodeGeneratorWorking from '../../components/tools/other/BarcodeGeneratorWorking.jsx';
import ColorPickerWorking from '../../components/tools/other/ColorPickerWorking.jsx';
import Base64Working from '../../components/tools/other/Base64Working.jsx';
import HashGeneratorWorking from '../../components/tools/other/HashGeneratorWorking.jsx';
import UrlEncoderWorking from '../../components/tools/other/UrlEncoderWorking.jsx';
import LoremIpsumWorking from '../../components/tools/other/LoremIpsumWorking.jsx';
import WordCounterWorking from '../../components/tools/other/WordCounterWorking.jsx';
import CaseConverterWorking from '../../components/tools/other/CaseConverterWorking.jsx';
import JsonFormatterWorking from '../../components/tools/other/JsonFormatterWorking.jsx';
import CsvViewerWorking from '../../components/tools/other/CsvViewerWorking.jsx';
import MarkdownPreviewWorking from '../../components/tools/other/MarkdownPreviewWorking.jsx';
import RegexTesterWorking from '../../components/tools/other/RegexTesterWorking.jsx';
import UuidGeneratorWorking from '../../components/tools/other/UuidGeneratorWorking.jsx';
import TimestampConverterWorking from '../../components/tools/other/TimestampConverterWorking.jsx';

const WORKING_BY_SLUG = {
  'qr-code-generator': QrCodeGeneratorWorking,
  'barcode-generator': BarcodeGeneratorWorking,
  'color-picker': ColorPickerWorking,
  'base64-encoder': Base64Working,
  'hash-generator': HashGeneratorWorking,
  'url-encoder': UrlEncoderWorking,
  'lorem-ipsum': LoremIpsumWorking,
  'word-counter': WordCounterWorking,
  'case-converter': CaseConverterWorking,
  'json-formatter': JsonFormatterWorking,
  'csv-viewer': CsvViewerWorking,
  'markdown-preview': MarkdownPreviewWorking,
  'regex-tester': RegexTesterWorking,
  'uuid-generator': UuidGeneratorWorking,
  'timestamp-converter': TimestampConverterWorking,
};

export default function OtherToolPage({ tool }) {
  const Working = WORKING_BY_SLUG[tool.slug];

  return (
    <>
      <Head>
        <title>{tool.name} — ImageYantra</title>
        <meta name="description" content={tool.desc} />
      </Head>
      <PageShell>
        <OtherToolLayout title={tool.name} description={tool.desc}>
          {Working ? (
            <Working />
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
              This tool is being rebuilt. Check back soon.
            </div>
          )}
        </OtherToolLayout>
      </PageShell>
    </>
  );
}
