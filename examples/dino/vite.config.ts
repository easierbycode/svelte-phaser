import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // svelte-phaser is consumed from source (file: dependency) — make sure it
    // shares this app's phaser and svelte instances
    dedupe: ['phaser', 'svelte'],
  },
  server: {
    // Optional: the full app (github.com/easierbycode/dino-sp) runs a Deno +
    // Oak + PostgreSQL API server on :8004 for the leaderboard and settings.
    // Without it the game still runs — API features just degrade gracefully.
    proxy: {
      '/api': 'http://localhost:8004',
    },
  },
})
