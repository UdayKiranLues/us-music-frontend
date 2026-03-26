import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000 
      },
      manifest: {
        name: 'US Music',
        short_name: 'US Music',
        description: 'A modern, responsive music streaming platform.',
        theme_color: '#0f0f11',
        background_color: '#0f0f11',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://placehold.co/192',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
