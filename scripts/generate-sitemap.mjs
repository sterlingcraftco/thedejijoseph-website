/**
 * Build-time sitemap generator for the current Vite SPA.
 *
 * Googlebot can't discover /notes/:slug URLs in a client-rendered SPA because
 * those links only exist after JS runs + a Ghost fetch succeeds. This script
 * fetches every published post slug from the Ghost Content API at build time
 * and writes a static public/sitemap.xml listing all routes.
 *
 * NOTE: This is a stopgap for the Vite build. Once the site is rebuilt in
 * Astro, sitemap generation is handled natively by @astrojs/sitemap and this
 * script (plus the build wiring in package.json) should be removed.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SITE_URL = 'https://thedejijoseph.com';
const GHOST_API = 'https://notes.thedejijoseph.com/ghost/api/content';
const GHOST_KEY = 'd59e0260aa7961f6ad52bdb92f';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects', priority: '0.8', changefreq: 'monthly' },
  { path: '/notes', priority: '0.9', changefreq: 'daily' },
];

async function fetchPosts() {
  const url = new URL(`${GHOST_API}/posts/`);
  url.searchParams.set('key', GHOST_KEY);
  url.searchParams.set('fields', 'slug,updated_at,published_at');
  url.searchParams.set('limit', 'all');
  url.searchParams.set('order', 'published_at desc');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Ghost API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.posts ?? [];
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function main() {
  let posts = [];
  try {
    posts = await fetchPosts();
    console.log(`[sitemap] fetched ${posts.length} posts from Ghost`);
  } catch (err) {
    // Don't fail the build if Ghost is unreachable — emit static routes only.
    console.warn(`[sitemap] WARNING: ${err.message}. Emitting static routes only.`);
  }

  const entries = [
    ...STATIC_ROUTES.map((r) =>
      urlEntry(`${SITE_URL}${r.path}`, undefined, r.changefreq, r.priority)
    ),
    ...posts.map((p) =>
      urlEntry(
        `${SITE_URL}/notes/${p.slug}`,
        (p.updated_at ?? p.published_at)?.split('T')[0],
        'weekly',
        '0.7'
      )
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
  await writeFile(outPath, xml, 'utf8');
  console.log(`[sitemap] wrote ${entries.length} URLs to public/sitemap.xml`);
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
