import { Head } from 'vite-react-ssg';
import PageShell from '../../components/layout/PageShell.jsx';
import ToolShell from '../../components/tools/ToolShell.jsx';
import FileWorkspace from '../../components/tools/FileWorkspace.jsx';

/**
 * Drop-in "File Selected" page for any tool that hasn't had its full
 * working interface built yet. Reuses the same ToolShell dropzone as
 * the finished tools (Compress Image, Crop Image) for file selection,
 * and the same FileWorkspace (ad sidebar + main workspace + settings
 * panel) that Compress Image uses, so every Image Tool feels
 * consistent even before its real processing logic ships.
 *
 * `workspaceLayout` is opt-in per call site (see ToolPage.jsx), so
 * other categories keep their current plain layout until they're
 * ready to adopt this same page.
 */
export default function GenericSelectFilePage({
  name,
  titleAccent,
  desc,
  accept = 'image/*',
  multiple = true,
  fileNoun = 'FILE',
  workspaceLayout = false,
}) {
  return (
    <>
      <Head>
        <title>{name} — ImageYantra</title>
        <meta name="description" content={desc} />
      </Head>
      <PageShell>
        <ToolShell
          title={name}
          titleAccent={titleAccent}
          description={desc}
          accept={accept}
          multiple={multiple}
          maxFiles={multiple ? 10 : 1}
          fileNoun={fileNoun}
          workspaceLayout={workspaceLayout}
          renderResult={() => null}
        >
          {(files, api) => (
            <FileWorkspace
              files={files}
              api={api}
              multiple={multiple}
              toolName={name}
              fileNoun={fileNoun}
            />
          )}
        </ToolShell>
      </PageShell>
    </>
  );
}
