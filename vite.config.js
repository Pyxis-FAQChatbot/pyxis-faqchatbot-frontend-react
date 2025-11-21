import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      }
    }),
  ],
// 개발용 백엔드포트, 배포시에는 뺄것
  server: {
    proxy: {
      '/api': 'http://localhost:8081/'
    }
  }
})
