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
    isActive
      ? 'text-emerald-400 text-sm'
      : 'text-zinc-500 hover:text-white text-sm transition-colors'

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

      <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search all anime..."
          className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-3 py-1.5 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors w-44 lg:w-60"
        />
        <button
          type="submit"
          className="border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0"
        >
          Search
        </button>
      </form>
    </nav>
  )
}
