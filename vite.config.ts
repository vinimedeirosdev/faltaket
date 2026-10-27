/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt": o app avisa que existe versão nova e o usuário escolhe quando atualizar
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon-48x48.png', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'FaltaKet',
        short_name: 'FaltaKet',
        description: 'Controle suas faltas da faculdade sem susto.',
        lang: 'pt-BR',
        theme_color: '#db2777',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // service worker próprio (src/sw.ts): cache offline + lembretes do Firebase Cloud Messaging
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
    }),
  ],
  build: {
    // o SDK do Firebase sozinho tem ~650 kB (190 kB gzip)
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // separa as bibliotecas grandes: cacheiam melhor entre deploys
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/]@?firebase/ },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            {
              name: 'ui',
              test: /node_modules[\\/](radix-ui|@radix-ui|vaul|motion|framer-motion|sonner)/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
