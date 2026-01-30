import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' обеспечивает работу путей к файлам (JS, CSS) 
  // независимо от того, лежит сайт в корне или в подпапке (как на GitHub Pages)
  base: './',
  build: {
    outDir: 'dist',
  }
})