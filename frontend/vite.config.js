import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({command}) => {
  const apiProxy = {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  };

  const config = {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
  }

  return config
})
