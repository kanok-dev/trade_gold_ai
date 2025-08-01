import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  preview: {
    allowedHosts: ['golden-ai.kanoks.me', 'localhost', '127.0.0.1']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
