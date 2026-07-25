/**
 * PDF Tools catalog. Home page shows a slice of this list;
 * the /pdf-tools page shows the full catalog.
 * `group` is used as the category filter on the /pdf-tools page.
 */
export const PDF_TOOLS = [
  { slug: "jpg-to-pdf", name: "JPG to PDF", desc: "Convert JPG images into a single PDF document.", icon: "imgpdf", category: "PDF Tools", group: "Convert" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", desc: "Convert each page of a PDF into a JPG image.", icon: "imgpdf", category: "PDF Tools", group: "Convert" },
  { slug: "png-to-pdf", name: "PNG to PDF", desc: "Convert PNG images into a single PDF document.", icon: "imgpdf", category: "PDF Tools", group: "Convert" },
  { slug: "arrange-pdf", name: "Arrange PDF", desc: "Drag and drop to reorder pages in any PDF document.", icon: "arrange", category: "PDF Tools", group: "Organize" },
  { slug: "remove-pages", name: "Remove Pages", desc: "Delete specific pages from a PDF document.", icon: "manage", category: "PDF Tools", group: "Organize" },
  { slug: "compress-pdf", name: "Compress PDF", desc: "Reduce PDF file size while keeping it readable.", icon: "compresspdf", category: "PDF Tools", group: "Compress" },
  { slug: "compress-under-100kb", name: "Compress under 100KB", desc: "Compress a PDF file to under 100KB.", icon: "compresspdf", category: "PDF Tools", group: "Compress" },
  { slug: "compress-under-500kb", name: "Compress under 500KB", desc: "Compress a PDF file to under 500KB.", icon: "compresspdf", category: "PDF Tools", group: "Compress" },
  { slug: "merge-pdf", name: "Merge PDF", desc: "Combine multiple PDF files into a single document.", icon: "merge", category: "PDF Tools", group: "Organize" },
  { slug: "split-pdf", name: "Split PDF", desc: "Split a large PDF into multiple separate files.", icon: "split", category: "PDF Tools", group: "Organize" },
  { slug: "html-to-pdf", name: "HTML to PDF", desc: "Convert a web page or HTML file into a clean PDF.", icon: "htmlpdf", category: "PDF Tools", group: "Convert" },
  { slug: "remove-blank-pages", name: "Remove Blank Pages", desc: "Automatically detect and remove blank pages from a PDF.", icon: "manage", category: "PDF Tools", group: "Organize" },
  { slug: "unlock-pdf", name: "Unlock PDF", desc: "Remove password protection from a PDF file.", icon: "unlock", category: "PDF Tools", group: "Security" },
  { slug: "encrypt-pdf", name: "Encrypt PDF", desc: "Add password protection to a PDF file.", icon: "lock", category: "PDF Tools", group: "Security" },
  { slug: "extract-pages", name: "Extract Pages", desc: "Pull specific pages out of a PDF into a new file.", icon: "manage", category: "PDF Tools", group: "Organize" },
];
