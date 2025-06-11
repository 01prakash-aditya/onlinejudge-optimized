import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@reduxjs/toolkit'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Remove proxy for production - we'll handle API calls directly
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  define: {
    // Ensure environment variables are available
    'process.env': process.env
  }
})