import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useWatchlist } from '../hooks/useWatchlist'
import { useDebounce } from '../hooks/useDebounce'
import { getSearchSuggestions, getRandomAnime } from '../services/anilistApi'
import { ThemeToggle } from './ThemeToggle'
import { MobileMenu } from './MobileMenu'
import { IMG_FALLBACK } from '../utils/images'

export function Navbar() {
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loadingRandom, setLoadingRandom] = useState(false)
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 30,
  })

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) { navigate(`/search?q=${encodeURIComponent(q)}`); setQuery(''); setOpen(false) }
  }

  function handleSelect(anime) {
    navigate(`/anime/${anime.mal_id}`)
    setQuery(''); setOpen(false)
  }

  async function handleRandom() {
    if (loadingRandom) return
    setLoadingRandom(true)
    try { const anime = await getRandomAnime(); navigate(`/anime/${anime.mal_id}`) }
    finally { setLoadingRandom(false) }
  }

  const showDropdown = open && debouncedQuery.trim().length >= 2 && suggestions.length > 0
  const linkClass = ({ isActive }) =>
    isActive ? 'text-emerald-400 text-sm' : 'text-zinc-500 hover:text-white text-sm transition-colors'

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black border-b border-zinc-900 px-4 md:px-6 py-3 flex items-center gap-3 md:gap-5">
        <Link to="/" className="text-xl font-bold text-emerald-400 mr-2 shrink-0">MoMoAnime!</Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-5">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/featured" className={linkClass}>Featured</NavLink>
          <NavLink to="/upcoming" className={linkClass}>Upcoming</NavLink>
          <NavLink to="/seasons" className={linkClass}>Seasons</NavLink>
          <NavLink to="/schedule" className={linkClass}>Schedule</NavLink>
          <NavLink to="/watchlist" className={linkClass}>
            Watchlist
            {watchlist.length > 0 && (
              <span className="ml-1.5 bg-emerald-500 text-black text-xs rounded-full px-1.5 py-0.5 font-semibold">{watchlist.length}</span>
            )}
          </NavLink>
          <NavLink to="/stats" className={linkClass}>Stats</NavLink>
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <button
            onClick={handleRandom}
            disabled={loadingRandom}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default shrink-0"
            aria-label="Surprise me — random anime"
            title="Surprise me — random anime"
          >
            {loadingRandom ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            )}
          </button>
          <ThemeToggle />
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative" ref={containerRef}>
              <input
                id="navbar-search"
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                placeholder="Search… ( / )"
                aria-label="Search anime"
                className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-3 py-1.5 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors w-44 lg:w-60"
              />
              {showDropdown && (
                <div className="absolute top-full mt-1 left-0 w-72 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shadow-2xl z-50">
                  {suggestions.map(anime => {
                    const title = anime.title_english ?? anime.title
                    return (
                      <button key={anime.mal_id} type="button" onClick={() => handleSelect(anime)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                      >
                        <img src={anime.images?.jpg?.image_url} alt={title} className="w-8 h-11 object-cover rounded shrink-0 bg-zinc-800" referrerPolicy="no-referrer" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm truncate">{title}</p>
                          <p className="text-zinc-600 text-xs flex gap-2 mt-0.5">
                            {anime.type && <span>{anime.type}</span>}
                            {anime.score && <span className="text-emerald-500">★ {anime.score}</span>}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                  <button type="submit" className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-zinc-800 border-t border-zinc-800 transition-colors cursor-pointer">
                    See all results for "<span className="font-medium">{debouncedQuery}</span>" →
                  </button>
                </div>
              )}
            </div>
            <button type="submit" className="border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0">
              Search
            </button>
          </form>
        </div>

        {/* Mobile right side */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          <ThemeToggle />
          <button
            onClick={() => navigate('/search')}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
