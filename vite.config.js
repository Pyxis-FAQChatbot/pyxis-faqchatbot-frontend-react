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
  // server: {
  //   host: '0.0.0.0',
  //   port: 3000,
  //   https: {
  //     key: fs.readFileSync('localhost+1-key.pem'),
  //     cert: fs.readFileSync('localhost+1.pem')
  //   }
  // }
})
