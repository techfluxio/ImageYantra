/**
 * The page a user lands on immediately after selecting a file.
 *
 * NOTE: PageShell already renders a sticky left ad rail on every page
 * (see components/layout/PageShell.jsx `AdRail`), so this component
 * intentionally does NOT add another ad column — that would duplicate
 * it. It exists purely as the seam where a future per-category layout
 * tweak (PDF Tools / Exam Tools) could hook in without touching every
 * tool page individually.
 */
export default function ToolWorkspaceLayout({ children }) {
  return <>{children}</>;
}
