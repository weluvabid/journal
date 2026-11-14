import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import remarkPipeTables from './src/lib/remark-pipe-tables.mjs';

export default defineConfig({
  output: 'static',
  base: process.env.ASTRO_BASE_PATH ?? '/',
  trailingSlash: 'always',
  redirects: {
    '/journal/building-without-user-accounts/':
      '/journal/frontend-atlas-progress-without-accounts/',
    '/journal/component-libraries-not-black-boxes/': '/journal/building-iris/',
    '/journal/cost-aware-eviction-policies/': '/journal/building-a-cache-from-first-principles/',
  },
  markdown: {
    processor: satteri({ mdastPlugins: [remarkPipeTables] }),
  },
  integrations: [mdx(), svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Careful, I use this to check on my phones and other devices
  server: {
    host: true,
    allowedHosts: ['mineral-counseling-reviewer-stays.trycloudflare.com'],
  },
});
