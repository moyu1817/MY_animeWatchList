import { Routes, Route } from 'react-router-dom'
import { WatchlistProvider } from './context/WatchlistContext'
import { Navbar } from './components/Navbar'
import { ScrollToTop } from './components/ScrollToTop'
import { LoadingBar } from './components/LoadingBar'
import { BackToTop } from './components/BackToTop'
import { Home } from './pages/Home'
import { Featured } from './pages/Featured'
import { Upcoming } from './pages/Upcoming'
import { Seasons } from './pages/Seasons'
import { Search } from './pages/Search'
import { Watchlist } from './pages/Watchlist'
import { AnimeDetail } from './pages/AnimeDetail'

export default function App() {
  return (
    <WatchlistProvider>
      <div className="min-h-screen bg-black text-white">
        <LoadingBar />
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/featured" element={<Featured />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
          </Routes>
        </main>
        <BackToTop />
      </div>
    </WatchlistProvider>
  )
}
