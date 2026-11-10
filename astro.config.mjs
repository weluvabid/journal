import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://weluvabid.github.io',
  base: process.env.ASTRO_BASE_PATH ?? '/',
  trailingSlash: 'always',
  integrations: [mdx(), svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Careful, I use this to check on my phones and other devices
  // server: {
  //   host: true,
  //   allowedHosts: [".ngrok-free.app", ".ngrok.app"],
  // },
});
