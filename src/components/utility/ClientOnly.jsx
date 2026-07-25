import { useEffect, useState } from 'react';

/**
 * Renders `fallback` during SSG prerendering (Node) and on the very
 * first client render (so hydration matches), then swaps to the real
 * `children` right after mount. Required because many tool pages use
 * browser-only APIs (Canvas, FileReader, WebAssembly, Web Workers via
 * cropperjs / heic2any / onnxruntime-web / @imgly/background-removal /
 * jsbarcode / qrcode) that don't exist in the Node build step.
 */
export default function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}
