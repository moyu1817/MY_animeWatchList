# MoMoAnime!

A production-ready anime watchlist web app. Browse upcoming and seasonal anime, explore archives, manage a personal watchlist with status tracking, and discover new series — all without a backend.

**Live:** [my-anime-watch-list.vercel.app](https://my-anime-watch-list.vercel.app)

---

## Features

- **Browse** — Upcoming, currently airing, top rated, most popular, and seasonal archives
- **Search** — Full-text search with autocomplete, genre filtering, type and status filters
- **Schedule** — Weekly airing schedule by day
- **Watchlist** — Add anime, track status (Plan to Watch / Watching / Completed / Dropped), rate titles 1–10
- **Stats** — Personal stats dashboard with status breakdown, rating distribution, and episode count
- **Export / Import** — Back up and restore your watchlist as JSON
- **PWA** — Installable on desktop and mobile; works offline via service worker caching
- **Dark / Light theme** — Persisted across sessions
- **Recently Viewed** — Automatically tracked browsing history on the home page

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 18 + Vite 8 |
| Styling | TailwindCSS v4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| State (watchlist) | React Context + localStorage |
| PWA | vite-plugin-pwa + Workbox |
| Tests | Vitest + Testing Library |
| Deployment | Vercel |
| Data source | [Jikan API v4](https://jikan.moe) (unofficial MyAnimeList API) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
  components/     # Reusable UI (AnimeCard, Navbar, WatchlistButton, SkeletonCard…)
  pages/          # Route-level views (Home, Upcoming, Seasons, Search, AnimeDetail…)
  hooks/          # Custom hooks (useWatchlist, useDebounce, useInfiniteScroll…)
  services/       # Jikan API calls — jikanApi.js
  context/        # WatchlistContext, ThemeContext, RecentlyViewedContext
  utils/          # Pure helpers (dedupByMalId, STATUS_LABELS…)

public/
  icons/          # PWA icons (192×192, 512×512)
  og-image.png    # Social preview image (1200×630)
  sitemap.xml     # Static route sitemap
  robots.txt
  manifest.json   # PWA manifest

scripts/
  gen-og-png.mjs      # Regenerate og-image.png from og-image.svg
  gen-pwa-icons.mjs   # Regenerate PWA icons from favicon.svg
```

---

## Deployment

The app deploys automatically to Vercel on every push to `main`. The `vercel.json` config handles SPA routing and security headers.

To regenerate image assets after changing icons:

```bash
node scripts/gen-pwa-icons.mjs   # PWA icons from favicon.svg
node scripts/gen-og-png.mjs      # OG image from og-image.svg
```

---

## API

Data is sourced from [Jikan API v4](https://jikan.moe) — an unofficial, read-only MyAnimeList REST API. Rate limit: 3 requests/second. TanStack Query caching (10-minute stale time) keeps usage well within limits.

---

## License

MIT — see [LICENSE](LICENSE) for details.

> Anime data provided by [Jikan API](https://jikan.moe). Not affiliated with MyAnimeList.
