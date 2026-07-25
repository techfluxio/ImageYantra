import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@data': path.resolve(__dirname, './src/data'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal', 'onnxruntime-web'],
  },
  ssgOptions: {
    // Mock window/document/etc. during the Node build step so tool pages
    // that reference browser globals at module scope don't crash the
    // prerender (the real interactive logic still only runs client-side).
    mock: true,
    // Admin panel is behind login and shouldn't be statically generated —
    // it still works at runtime via client-side routing, same as before.
    includedRoutes(paths) {
      return paths.filter((p) => !p.startsWith('/admin'));
    },
    // Every real page sets its own <title>/<meta description> via <Head>
    // (data-rh="true"), which the SSR injects *in addition to* the static
    // fallback ones in index.html. Once a real one exists, drop the
    // fallback duplicate so each page ships exactly one <title> and one
    // description meta tag.
    onPageRendered(_route, html) {
      const hasRealTitle = /<title data-rh="true">/.test(html);
      let out = html;
      if (hasRealTitle) {
        out = out.replace(/<title>ImageYantra — Free Online Image &amp; PDF Tools<\/title>/, '');
        out = out.replace(
          /<meta name="description" content="Free online image and PDF tools:[^"]*"\s*\/?>/,
          '',
        );
      }
      return out;
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
