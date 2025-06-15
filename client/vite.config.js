import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const isDocker = process.env.IS_DOCKER === 'true'

const getApiTarget = () => {
  if (isDocker) {
    return 'http://api:3000'
  }
  
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? 'http://localhost:3000' : 'http://192.168.130.234:3000'
}

const apiTarget = getApiTarget()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@reduxjs/toolkit'],
  },
  server: {
    host: '0.0.0.0', 
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        timeout: 30000, 
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
            console.log('Target:', apiTarget);
            console.log('Request:', req.method, req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxying request:', req.method, req.url, '→', apiTarget);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
  },
})