import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/PersonalFin/',
  server: { host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PersonalFin',
        short_name: 'PersonalFin',
        description: 'Isiklik rahaarvestus',
        theme_color: '#1f7a5e',
        background_color: '#f2f4f1',
        display: 'standalone',
        scope: '/PersonalFin/',
        start_url: '/PersonalFin/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
