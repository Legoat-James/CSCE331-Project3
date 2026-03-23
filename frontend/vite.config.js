import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({command}) => {
  const config = {
    plugins: [react()],
    server: {
      port: 3000
    }
  }
  //only use local proxy when running 'npm run dev'
  if(command === "serve"){
    config.server = {
      ...config.server,
      proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    }
  }
  
  return config
})
