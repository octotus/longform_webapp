import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'sql.js': 'sql.js/dist/sql-wasm-browser.js',
    },
  },
  optimizeDeps: {
    include: ['sql.js'],
  },
})
