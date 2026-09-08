import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves this from a subfolder; Vercel serves it from the domain root.
  base: process.env.VERCEL ? '/' : '/felix.deguzman-dev/',
})
