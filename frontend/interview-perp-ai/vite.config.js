import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // 🚨 Only proxy in local dev mode — NEVER in production
  server: mode === 'development' ? {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  } : undefined,

  optimizeDeps: {
    include: ['pdfjs-dist']
  },

  assetsInclude: ['**/*.worker.js']
}))
