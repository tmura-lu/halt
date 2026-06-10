import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,   // required for Docker bind-mounts on Windows
      interval: 300,
    },
    proxy: {
      '/api': {
        target: 'http://halt-web:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://halt-web:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://halt-web:8000',
        changeOrigin: true,
      },
    },
  },
})
