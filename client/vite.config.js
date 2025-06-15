import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const isDocker = process.env.IS_DOCKER === 'true'
const apiTarget = isDocker ? 'http://api:3000' : 'http://localhost:3000'














export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@reduxjs/toolkit'],
  },
  server: {
    host: true, // or '0.0.0.0'
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,














      },
    },
  },
})