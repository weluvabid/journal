import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import remarkPipeTables from './src/lib/remark-pipe-tables.mjs';

export default defineConfig({
  output: 'static',
  base: process.env.ASTRO_BASE_PATH ?? '/',
  trailingSlash: 'always',
  integrations: [mdx({ remarkPlugins: [remarkPipeTables] }), svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Careful, I use this to check on my phones and other devices
  server: {
    host: true,
    allowedHosts: ['mineral-counseling-reviewer-stays.trycloudflare.com'],
  },
});
