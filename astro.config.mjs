// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://rafaelsdias.dev',
  base: '/',
  integrations: [mdx(), sitemap()],
  devToolbar: {
    enabled: false
  },
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'astro-client': ['astro/runtime/client/idle.js', 'astro/runtime/client/load.js']
          }
        }
      }
    }
  }
});
