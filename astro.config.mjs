import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical origin — drives sitemap URLs and <link rel="canonical">.
  site: 'https://thedejijoseph.com',
  // Static output: every route (incl. /notes/[slug]) is pre-rendered to HTML
  // at build time, so content is in the raw HTML for crawlers.
  output: 'static',
  integrations: [react(), sitemap()],
  server: { port: 8080 },
  // Tailwind v3 is processed via postcss.config.js (Vite auto-loads it), so the
  // deprecated @astrojs/tailwind integration is not needed.
});
