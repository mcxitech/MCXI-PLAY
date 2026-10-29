import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Public bundle = preview edition (watermark, partial dedication). See src/game/edition.ts
  define: {
    __MCXI_FULL__: 'false',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
