import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical origin — drives sitemap URLs and <link rel="canonical">.
  site: 'https://thedejijoseph.com',
  // Static output: every route (incl. /notes/[slug]) is pre-rendered to HTML
  // at build time, so content is in the raw HTML for crawlers.
  output: 'static',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }), // base styles come from src/styles/global.css
    sitemap(),
  ],
  server: { port: 8080 },
});
