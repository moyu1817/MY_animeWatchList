import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WatchlistProvider } from './context/WatchlistContext'
import { ThemeProvider } from './context/ThemeContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import { Navbar } from './components/Navbar'
import { ScrollToTop } from './components/ScrollToTop'
import { LoadingBar } from './components/LoadingBar'
import { BackToTop } from './components/BackToTop'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RateLimitBanner } from './components/RateLimitBanner'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { ToastProvider } from './context/ToastContext'
import { Toast } from './components/Toast'

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
      document.getElementById('navbar-search')?.focus()
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
      <ToastProvider>
      <WatchlistProvider>
        <RecentlyViewedProvider>
          <div className="min-h-screen bg-black text-white">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-black focus:rounded-md focus:text-sm focus:font-semibold">
              Skip to content
            </a>
            <LoadingBar />
            <ScrollToTop />
            <KeyboardShortcuts />
            <Navbar />
            <main id="main-content">
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
              <p className="mt-1">Anime data provided by <a href="https://jikan.moe" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-emerald-400 transition-colors">Jikan API</a> (unofficial MyAnimeList API). Not affiliated with MyAnimeList.</p>
            </footer>
            <BackToTop />
            <RateLimitBanner />
            <Toast />
          </div>
        </RecentlyViewedProvider>
      </WatchlistProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
