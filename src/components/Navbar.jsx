import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'

export function Navbar() {
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setQuery('')
    }
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'text-white text-sm' : 'text-gray-400 hover:text-white text-sm transition-colors'

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center gap-5">
      <Link to="/" className="text-xl font-bold text-purple-400 mr-2 shrink-0">AniWatch</Link>

      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/featured" className={linkClass}>Featured</NavLink>
      <NavLink to="/upcoming" className={linkClass}>Upcoming</NavLink>
      <NavLink to="/seasons" className={linkClass}>Seasons</NavLink>
      <NavLink to="/watchlist" className={linkClass}>
        Watchlist
        {watchlist.length > 0 && (
          <span className="ml-1.5 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5">
            {watchlist.length}
          </span>
        )}
      </NavLink>

      <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search all anime..."
          className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors w-44 lg:w-60"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Search
        </button>
      </form>
    </nav>
  )
}
