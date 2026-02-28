import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['selangor-parlimen.svg', 'icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'VibeSelangor',
        short_name: 'VibeSelangor',
        description: 'Selangor Builder Sprint 2026 — Now Everyone Can Build (NECB)',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#CE1126',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Builder Dashboard',
            short_name: 'Dashboard',
            description: 'Go to your builder dashboard',
            url: '/?page=dashboard',
            icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }]
          },
          {
            name: 'Builder Showcase',
            short_name: 'Showcase',
            description: 'View all builder projects',
            url: '/?page=showcase',
            icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }]
          }
        ],
        categories: ['education', 'productivity', 'social'],
        lang: 'ms-MY',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Don't enable SW in dev to avoid caching issues
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api/kracked': {
        target: 'https://krackeddevs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kracked/, ''),
      }
    }
  }
})


