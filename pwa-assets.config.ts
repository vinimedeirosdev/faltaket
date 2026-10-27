import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Gera os ícones do PWA a partir de public/favicon.svg:
//   npx pwa-assets-generator
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})
