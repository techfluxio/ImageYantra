import BatchFileGrid from './BatchFileGrid.jsx';
import SingleFilePreview from './SingleFilePreview.jsx';
import GenericToolSettings from './GenericToolSettings.jsx';

/**
 * The main-content slot rendered inside ToolWorkspaceLayout once a
 * file is selected — i.e. the "File Selected" page body.
 *
 * Reuses the Compress Image workspace design:
 *   - multiple files  -> BatchFileGrid (thumbnail grid, same as Compress)
 *   - single file     -> SingleFilePreview (same card, larger image area
 *                         instead of a thumbnail grid, since there's
 *                         only one file to show)
 * Both sit next to a right-hand settings panel, exactly like Compress.
 *
 * Category-agnostic: PDF Tools / Exam Tools / future categories can
 * reuse this unchanged by passing their own `files`, `multiple` and
 * `renderSettings`.
 */
export default function FileWorkspace({
  files,
  api,
  multiple,
  toolName,
  fileNoun = 'FILE',
  renderSettings,
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {multiple ? (
        <BatchFileGrid files={files} api={api} noun={`${fileNoun}s`} />
      ) : (
        <SingleFilePreview file={files[0]} api={api} />
      )}

      {renderSettings ? (
        renderSettings(files, api)
      ) : (
        <GenericToolSettings
          toolName={toolName}
          actionLabel={`${toolName} ${multiple ? `${fileNoun}S` : fileNoun}`}
        />
      )}
    </div>
  );
}
