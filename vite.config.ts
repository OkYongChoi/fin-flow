import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 4173 },
  preview: { port: 4173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/maplibre-gl')) return 'maplibre'
          if (id.includes('node_modules/@deck.gl')) return 'deck'
          if (id.includes('node_modules/react') || id.includes('node_modules/@tanstack')) return 'ui-runtime'
        },
      },
    },
  },
  test: { exclude: ['tests/**', 'node_modules/**'] },
})
