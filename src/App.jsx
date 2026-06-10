import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WatchlistProvider } from './context/WatchlistContext'
import { ThemeProvider } from './context/ThemeContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import { Navbar } from './components/Navbar'
import { ScrollToTop } from './components/ScrollToTop'
import { LoadingBar } from './components/LoadingBar'
import { BackToTop } from './components/BackToTop'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

const Home        = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Featured    = lazy(() => import('./pages/Featured').then(m => ({ default: m.Featured })))
const Upcoming    = lazy(() => import('./pages/Upcoming').then(m => ({ default: m.Upcoming })))
const Seasons     = lazy(() => import('./pages/Seasons').then(m => ({ default: m.Seasons })))
const Schedule    = lazy(() => import('./pages/Schedule').then(m => ({ default: m.Schedule })))
const Search      = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })))
const Watchlist   = lazy(() => import('./pages/Watchlist').then(m => ({ default: m.Watchlist })))
const Stats       = lazy(() => import('./pages/Stats').then(m => ({ default: m.Stats })))
const AnimeDetail = lazy(() => import('./pages/AnimeDetail').then(m => ({ default: m.AnimeDetail })))
const NotFound    = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
    </div>
  )
}

function KeyboardShortcuts() {
  useKeyboardShortcuts({
    '/': () => {
      const el = document.getElementById('navbar-search') ?? window.__navSearchRef?.current
      el?.focus()
    },
  })
  return null
}

function Page({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function App() {
  return (
    <ThemeProvider>
      <WatchlistProvider>
        <RecentlyViewedProvider>
          <div className="min-h-screen bg-black text-white">
            <LoadingBar />
            <ScrollToTop />
            <KeyboardShortcuts />
            <Navbar />
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Page><Home /></Page>} />
                  <Route path="/featured" element={<Page><Featured /></Page>} />
                  <Route path="/upcoming" element={<Page><Upcoming /></Page>} />
                  <Route path="/seasons" element={<Page><Seasons /></Page>} />
                  <Route path="/schedule" element={<Page><Schedule /></Page>} />
                  <Route path="/search" element={<Page><Search /></Page>} />
                  <Route path="/watchlist" element={<Page><Watchlist /></Page>} />
                  <Route path="/stats" element={<Page><Stats /></Page>} />
                  <Route path="/anime/:id" element={<Page><AnimeDetail /></Page>} />
                  <Route path="*" element={<Page><NotFound /></Page>} />
                </Routes>
              </Suspense>
            </main>
            <footer className="border-t border-zinc-900 mt-16 py-6 px-4 text-center text-zinc-700 text-xs">
              <p>© {new Date().getFullYear()} MoMoAnime. All rights reserved.</p>
              <p className="mt-1">
                Anime data provided by{' '}
                <a href="https://jikan.moe" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-emerald-400 transition-colors">Jikan API</a>
                {' '}(unofficial MyAnimeList API). Not affiliated with MyAnimeList.
              </p>
            </footer>
            <BackToTop />
          </div>
        </RecentlyViewedProvider>
      </WatchlistProvider>
    </ThemeProvider>
  )
}
