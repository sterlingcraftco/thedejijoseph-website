# thedejijoseph.com

Personal website for Deji Joseph — LLMOps Engineer, Data Analyst & Strategist.

## Tech stack

- **[Astro](https://astro.build) (static / SSG)** — every route is pre-rendered to
  HTML at build time
- **React** — used only for interactive "islands" (see below)
- **Tailwind CSS** (v3) + `@tailwindcss/typography` for Ghost article content
- **[Ghost](https://ghost.org)** (headless) at `notes.thedejijoseph.com` — the CMS
  for the Notes/blog
- **[Hono](https://hono.dev)** — a tiny Node backend for the newsletter subscribe
  endpoint

## Why Astro (the 2026 rebuild)

This site was previously a client-rendered Vite + React Router SPA. The blog
content is served via Ghost's Content API and was fetched **in the browser**,
which meant:

- Blog post URLs (`/notes/:slug`) existed only after JS ran, so Googlebot never
  reliably discovered them — **none of the posts were getting indexed** (confirmed
  via Search Console URL Inspection).
- Per-page `<title>` / Open Graph / structured-data tags were injected at runtime,
  so non-JS social crawlers (LinkedIn, Slack, X, Facebook) only saw the static
  shell.

The rebuild moves rendering to **build time**. Now:

- `src/pages/notes/[slug].astro` uses `getStaticPaths()` to fetch every post from
  Ghost and generate **one static HTML page per post**.
- `src/pages/notes/index.astro` server-renders the full, linked list of posts, so
  every post is reachable from raw HTML (discovery) and the listing itself is
  indexable.
- `@astrojs/sitemap` emits `sitemap-index.xml` covering all routes; `robots.txt`
  advertises it.
- `src/layouts/Layout.astro` writes title / canonical / OG / Twitter / JSON-LD
  into the static `<head>` — no runtime head library needed.

See the architecture notes below for the trade-offs (content freshness).

## Project structure

```
src/
  layouts/Layout.astro       # <head>: SEO meta, OG/Twitter, JSON-LD, GA, global CSS
  pages/
    index.astro              # Home
    about.astro              # About
    projects.astro           # Placeholder portfolio; redirects to /about on prod
    notes/index.astro        # Blog list (server-rendered cards + JS filter)
    notes/[slug].astro       # One static page per Ghost post (getStaticPaths)
    404.astro
  components/
    Header / Footer / Hero / Introduction / CallToAction .astro   # static
    Icon.astro               # inline SVG icons (Lucide paths) — no JS runtime
    SubscribeForm.tsx        # React island (client:visible) — the only interactive UI
  lib/ghost.ts               # Ghost Content API client (used at build time)
  styles/global.css          # design tokens + component classes + Ghost prose styles
server/
  index.ts                   # Hono app
  routes/ghost.ts            # POST /api/ghost/subscribe -> Ghost Admin API
public/
  assets/                    # logo + headshots referenced by absolute path
  robots.txt, favicon.png, og-image.png
```

### Notable choices

- **Islands, not a SPA.** Only `SubscribeForm` ships JS to the browser. Search /
  tag-filtering on `/notes` is a small vanilla `<script>` operating on the
  server-rendered cards, so the list stays fully crawlable.
- **Icons are inlined SVG** (`Icon.astro`) instead of `lucide-react`, so static
  pages don't pull in a React runtime just to draw an arrow.
- **Removed with the SPA:** `react-router-dom`, `@tanstack/react-query`,
  `react-helmet-async`, all `shadcn/ui` + Radix components, and the Supabase
  client. Astro's file routing, build-time data loading, and `<head>` handling
  replace them.
- **Subscribe endpoint:** the live path is the Hono server
  (`server/routes/ghost.ts`). An earlier Supabase edge-function implementation
  was removed in favor of it.

## Local development

Requires Node.js 20+.

```sh
npm install

# Frontend (Astro dev server on :8080)
npm run dev

# Backend (Hono subscribe API on :3000) — only needed to test the subscribe form
npm run start:backend
```

Copy `.env.example` to `.env` and fill in values. `.env` is git-ignored.

| Variable              | Used by | Purpose                                            |
| --------------------- | ------- | -------------------------------------------------- |
| `GHOST_ADMIN_API_KEY` | backend | `{id}:{secret}` Admin key for creating subscribers |

`GHOST_ADMIN_API_KEY` is a **runtime** variable for the Hono backend, supplied
to the container as an env var (Dokploy "Environment"). The Astro frontend build
takes **no** env vars — the Ghost Content API URL + public key are hardcoded in
`src/lib/ghost.ts` — so the Docker build stage needs no build args.

## Build

```sh
npm run build      # astro build -> dist/
npm run preview    # serve dist/ locally
```

> **Build-time Ghost fetch:** `astro build` calls the Ghost Content API to
> generate the post pages and sitemap. The build environment **must** be able to
> reach `https://notes.thedejijoseph.com`. If Ghost is down the build fails by
> design rather than shipping an empty blog.

### Content freshness

Because posts are baked in at build time, **publishing a new post in Ghost does
not update the site until it is rebuilt.** Trigger a rebuild on publish — e.g. a
Ghost webhook hitting the deploy workflow, or a scheduled rebuild.

## Deployment

There are two deploy paths in this repo — reconcile to one if that's confusing:

1. **Self-hosted (Docker + Caddy)** — `Dockerfile` builds the Astro site, copies
   `dist/` into Caddy, and runs the Hono backend alongside. Caddy serves the
   static files and reverse-proxies `/api/*` to the Hono server on `:3000`
   (`Caddyfile`, `start.sh`). This path supports the newsletter subscribe API.
2. **GitHub Pages** — `.github/workflows/deploy.yml` builds and publishes `dist/`
   on push to `main`. Static only: the `/api/ghost/subscribe` backend is **not**
   available here, so the subscribe form won't work on a Pages-only deployment.
   Note: the workflow's `VITE_BASE_PATH` env is a no-op under Astro (set `base`
   in `astro.config.mjs` if a sub-path is ever needed; the custom domain serves
   at root).

The canonical origin for sitemap/OG/canonical URLs is set via `site` in
`astro.config.mjs` (`https://thedejijoseph.com`).
