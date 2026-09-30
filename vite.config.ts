import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' + rotas por hash: funciona em qualquer subcaminho do GitHub Pages / Cloudflare Pages.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: { include: ['tests/**/*.test.ts'] },
})
