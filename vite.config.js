import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Prompt instead of silently swapping the worker: never reload the app
      // under the user's feet while they are entering transactions.
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ExpenseFlow - Personal Finance Tracker',
        short_name: 'ExpenseFlow',
        description:
          'Track income, expenses and categories - and keep working when you are offline.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/dashboard',
        scope: '/',
        lang: 'en',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole shell (fonts included so PrimeReact/Tailwind
        // still look right with no connection).
        globPatterns: ['**/*.{js,css,html,svg,woff2,woff,ttf,png}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false, // we ask the user instead (registerType: 'prompt')
        runtimeCaching: [
          {
            // Transaction list + single transaction: network first so data is
            // always fresh, cache fallback for cold starts / offline.
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/expense/') && url.pathname !== '/expense/export',
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 4,
              cacheName: 'api-expense-v1',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Categories change rarely: serve instantly, refresh in background.
            urlPattern: ({ url }) => url.pathname.startsWith('/category/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-category-v1',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: {
        // Never register the SW in dev: a stale worker is the #1 cause of
        // "my change is not showing up". Test with: build && preview.
        enabled: false,
      },
    }),
  ],
})
