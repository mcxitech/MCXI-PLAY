import { defineConfig } from 'vite'

// Builds the standalone game engine used in exported ZIPs.
// Classic IIFE script (not an ES module) so index.html also works from file://.
// Runs after the main build, so it must not empty dist/.
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    outDir: 'dist/export-kit',
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: 'src/export/main.ts',
      formats: ['iife'],
      name: 'MCXIGift',
      fileName: () => 'game.js',
    },
  },
})
