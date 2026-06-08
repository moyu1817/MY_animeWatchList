# Anime Watchlist — CLAUDE.md

## Project Overview

A React + Vite anime watchlist web app. Users can browse upcoming/seasonal anime, discover new titles, and manage a personal watchlist with status tracking — all stored in localStorage (no backend required).

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **Data Fetching:** TanStack Query (React Query) — caching + async state
- **State (watchlist):** React Context + localStorage
- **API:** Jikan API v4 — `https://api.jikan.moe/v4`
- **Language:** JavaScript (JSX)

## Project Structure

```
src/
  components/        # Reusable UI (AnimeCard, WatchlistButton, StatusBadge, SkeletonCard, Navbar)
  pages/             # Route-level views
    Home.jsx         # Landing page — upcoming/seasonal highlights
    Upcoming.jsx     # Full upcoming anime grid with search & filter
    Watchlist.jsx    # User's saved anime list
    AnimeDetail.jsx  # Single anime detail view
  hooks/             # Custom hooks (useWatchlist, useDebounce)
  services/          # All Jikan API calls — jikanApi.js only
  context/           # WatchlistContext.jsx — global watchlist state
  utils/             # Pure helpers (formatDate, statusLabel, etc.)
  assets/            # Static images/icons
```

## Dev Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

## Jikan API Notes

- Base URL: `https://api.jikan.moe/v4`
- Rate limit: **3 req/sec, 60 req/min** — always rely on TanStack Query caching
- Always unwrap: `response.data.data`
- Key endpoints:
  - `GET /seasons/upcoming` — upcoming season anime list
  - `GET /seasons/now` — currently airing anime
  - `GET /anime/{id}` — full anime details
  - `GET /anime?q={query}&status=upcoming` — search upcoming anime
  - `GET /schedules` — airing schedule by day
  - `GET /anime/{id}/characters` — cast info (for detail page)

## Watchlist Feature

- Stored in **localStorage** under the key `anime_watchlist`
- Managed via `WatchlistContext` — wrap the app at the root level
- Each entry shape:
  ```js
  {
    mal_id: number,
    title: string,
    image_url: string,
    score: number | null,
    episodes: number | null,
    status: "plan_to_watch" | "watching" | "completed" | "dropped",
    addedAt: ISO string
  }
  ```
- `useWatchlist` hook exposes: `watchlist`, `addAnime`, `removeAnime`, `updateStatus`, `isInWatchlist`

## Key Pages & Features

### Home (`/`)
- Hero banner with a featured upcoming anime
- "Upcoming This Season" horizontal scroll row
- "Currently Airing" row

### Upcoming (`/upcoming`)
- Full grid of upcoming anime from `/seasons/upcoming`
- Filter by genre, type (TV/Movie/OVA), and day of week
- Search bar with 400ms debounce hitting `/anime?q=...&status=upcoming`
- Each card shows: cover, title, episode count, air date, score, "Add to Watchlist" button

### Watchlist (`/watchlist`)
- Lists all saved anime grouped by status (Plan to Watch → Watching → Completed → Dropped)
- Inline status dropdown to update per entry
- Remove button per entry
- Empty state with a CTA linking to `/upcoming`

### Anime Detail (`/anime/:id`)
- Full details: cover, synopsis, genres, studio, score, episode count, air date
- Status indicator (Upcoming / Airing / Finished)
- "Add to Watchlist" / status control
- Trailer embed if available (`trailer.embed_url`)

## Code Conventions

- One component per file, PascalCase filenames
- All Jikan API calls in `src/services/jikanApi.js` — never fetch inside components
- Use TanStack Query `useQuery` for all remote data; never `useEffect + useState` for API calls
- Use `useWatchlist()` hook to read/write watchlist — never access localStorage directly in components
- Prefer named exports
- Keep components under ~100 lines; extract logic to hooks

## Styling Guidelines

- Dark anime-themed UI: `bg-gray-950` base, accent colors `purple-500` / `pink-500` / `blue-400`
- Mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Skeleton loader (`animate-pulse`) on every data-dependent card while loading
- Hover transitions on cards: `transition-transform duration-150 hover:scale-105`
- Status badge colors: Plan to Watch = blue, Watching = green, Completed = purple, Dropped = red

## Do Not

- Do not call the Jikan API directly inside JSX/components — use `src/services/jikanApi.js`
- Do not access `localStorage` directly outside of `WatchlistContext`
- Do not hard-code anime IDs — always derive from route params or API response
- Do not skip skeleton loaders — never show an empty/blank card while fetching
- Do not add a backend or authentication unless explicitly requested
- Do not exceed 3 Jikan API requests per second — TanStack Query caching prevents this
