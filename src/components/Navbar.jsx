import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useWatchlist } from '../hooks/useWatchlist'
import { useDebounce } from '../hooks/useDebounce'
import { getSearchSuggestions, getRandomAnime } from '../services/jikanApi'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loadingRandom, setLoadingRandom] = useState(false)
  const containerRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 30,
  })

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setQuery('')
      setOpen(false)
    }
  }

  function handleSelect(anime) {
    navigate(`/anime/${anime.mal_id}`)
    setQuery('')
    setOpen(false)
  }

  async function handleRandom() {
    if (loadingRandom) return
    setLoadingRandom(true)
    try {
      const anime = await getRandomAnime()
      navigate(`/anime/${anime.mal_id}`)
    } finally {
      setLoadingRandom(false)
    }
  }

  const showDropdown = open && debouncedQuery.trim().length >= 2 && suggestions.length > 0
  const linkClass = ({ isActive }) =>
    isActive ? 'text-emerald-400 text-sm' : 'text-zinc-500 hover:text-white text-sm transition-colors'

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-zinc-900 px-6 py-3 flex items-center gap-5">
      <Link to="/" className="text-xl font-bold text-emerald-400 mr-2 shrink-0">MoMoAnime!</Link>

      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/featured" className={linkClass}>Featured</NavLink>
      <NavLink to="/upcoming" className={linkClass}>Upcoming</NavLink>
      <NavLink to="/seasons" className={linkClass}>Seasons</NavLink>
      <NavLink to="/watchlist" className={linkClass}>
        Watchlist
        {watchlist.length > 0 && (
          <span className="ml-1.5 bg-emerald-500 text-black text-xs rounded-full px-1.5 py-0.5 font-semibold">
            {watchlist.length}
          </span>
        )}
      </NavLink>

      <div className="ml-auto flex items-center gap-2">
        {/* Surprise me */}
        <button
          onClick={handleRandom}
          disabled={loadingRandom}
          className="text-zinc-500 hover:text-white text-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          title="Surprise me — random anime"
        >
          {loadingRandom ? '...' : '🎲'}
        </button>

        <ThemeToggle />

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative" ref={containerRef}>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Search all anime..."
              className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-3 py-1.5 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors w-44 lg:w-64"
            />
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 w-72 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shadow-2xl z-50">
                {suggestions.map(anime => {
                  const title = anime.title_english ?? anime.title
                  return (
                    <button
                      key={anime.mal_id}
                      type="button"
                      onClick={() => handleSelect(anime)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                    >
                      <img
                        src={anime.images?.jpg?.image_url}
                        alt={title}
                        className="w-8 h-11 object-cover rounded shrink-0"
                      />
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
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-zinc-800 border-t border-zinc-800 transition-colors cursor-pointer"
                >
                  See all results for "<span className="font-medium">{debouncedQuery}</span>" →
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>
    </nav>
  )
}
