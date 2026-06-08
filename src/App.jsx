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

const Home       = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Featured   = lazy(() => import('./pages/Featured').then(m => ({ default: m.Featured })))
const Upcoming   = lazy(() => import('./pages/Upcoming').then(m => ({ default: m.Upcoming })))
const Seasons    = lazy(() => import('./pages/Seasons').then(m => ({ default: m.Seasons })))
const Search     = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })))
const Watchlist  = lazy(() => import('./pages/Watchlist').then(m => ({ default: m.Watchlist })))
const AnimeDetail = lazy(() => import('./pages/AnimeDetail').then(m => ({ default: m.AnimeDetail })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <WatchlistProvider>
        <RecentlyViewedProvider>
          <div className="min-h-screen bg-black text-white">
            <LoadingBar />
            <ScrollToTop />
            <Navbar />
            <main>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/featured" element={<Featured />} />
                    <Route path="/upcoming" element={<Upcoming />} />
                    <Route path="/seasons" element={<Seasons />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/anime/:id" element={<AnimeDetail />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            <BackToTop />
          </div>
        </RecentlyViewedProvider>
      </WatchlistProvider>
    </ThemeProvider>
  )
}
