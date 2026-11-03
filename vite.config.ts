import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'github-pages-spa-fallback',
      apply: 'build',
      enforce: 'post',
      generateBundle(_options, bundle) {
        // Pages serves this document for deep links without changing the URL.
        const index = bundle['index.html'];
        if (index?.type !== 'asset') {
          this.error('Missing index.html for the GitHub Pages SPA fallback');
        }
        this.emitFile({ type: 'asset', fileName: '404.html', source: index.source });
      },
    },
  ],
  base: '/dev-tools/',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
  },
});
