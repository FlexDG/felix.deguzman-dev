import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://felix-deguzman-dev.vercel.app'
).replace(/\/+$/, '')

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n')

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <url>',
  `    <loc>${siteUrl}/</loc>`,
  `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>`,
  '    <changefreq>monthly</changefreq>',
  '    <priority>1.0</priority>',
  '  </url>',
  '</urlset>',
  '',
].join('\n')

function siteMeta() {
  return {
    name: 'site-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.split('%SITE_URL%').join(siteUrl),
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
    },
  }
}

const LOCKED_UNITS = { svh: '--svh', lvh: '--lvh', vh: '--lvh' }

function lockViewportUnits() {
  return {
    postcssPlugin: 'lock-viewport-units',
    OnceExit(root) {
      root.walkDecls((decl) => {
        if (!/\d(svh|lvh|vh)\b/.test(decl.value)) return
        decl.value = decl.value.replace(
          /(?<![\w.-])(-?\d*\.?\d+)(svh|lvh|vh)\b/g,
          (_, amount, unit) => `calc(${amount} * var(${LOCKED_UNITS[unit]}, 1${unit}))`,
        )
      })
    },
  }
}
lockViewportUnits.postcss = true

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMeta()],
  css: {
    postcss: {
      plugins: [lockViewportUnits()],
    },
  },
  // GitHub Pages serves this from a subfolder; Vercel serves it from the domain root.
  base: process.env.VERCEL ? '/' : '/felix.deguzman-dev/',
})
