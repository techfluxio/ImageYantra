import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './richTextEditor.css';

const TOOLBAR_OPTIONS = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'link'],
  ['clean'],
];

/**
 * RichTextEditor
 * A real WYSIWYG editor (bold, italic, headings, lists, links, color)
 * for blog posts and pages — stores/returns clean HTML, which the public
 * pages render directly. Wraps Quill (free, ~40KB gzipped, admin-only —
 * never loaded by the public site).
 */
export default function RichTextEditor({ value, onChange, minHeight = 260 }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const editorEl = document.createElement('div');
    containerRef.current.appendChild(editorEl);

    const quill = new Quill(editorEl, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: 'Write your content here…',
    });
    quillRef.current = quill;

    if (value) quill.clipboard.dangerouslyPasteHTML(value);

    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      onChangeRef.current(html === '<p><br></p>' ? '' : html);
    });

    return () => {
      quillRef.current = null;
      containerRef.current?.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. switching which post is being edited)
  // without fighting the user's own typing.
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (!quillRef.current) return;
    if (value === lastExternalValue.current) return;
    lastExternalValue.current = value;
    const current = quillRef.current.root.innerHTML;
    if (current !== value) {
      quillRef.current.setContents([]);
      if (value) quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        '--rte-min-height': `${minHeight}px`,
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
        border: '1.5px solid var(--col-border2)',
      }}
      className="admin-rich-text"
    />
  );
}