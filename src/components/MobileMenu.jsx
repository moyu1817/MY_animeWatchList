import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'
import { useTheme } from '../context/ThemeContext'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/featured', label: 'Featured' },
  { to: '/search', label: 'Categories' },
  { to: '/seasons', label: 'Seasons' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/stats', label: 'My Stats' },
]

export function MobileMenu({ isOpen, onClose }) {
  const { watchlist } = useWatchlist()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setQuery('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Navigation menu" className="fixed top-0 right-0 h-full w-72 z-50 bg-zinc-950 border-l border-zinc-900 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
          <span className="text-emerald-400 font-bold text-lg">MoMoAnime!</span>
          <button onClick={onClose} aria-label="Close menu" className="text-zinc-500 hover:text-white text-2xl leading-none cursor-pointer">×</button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="px-4 py-3 border-b border-zinc-900 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search anime..."
            aria-label="Search anime"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors shrink-0">
            Go
          </button>
        </form>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-4 py-4 flex-1 overflow-y-auto">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `px-3 py-3 rounded-md transition-colors flex items-center justify-between ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`
              }
            >
              <span>{label}</span>
              {label === 'Watchlist' && watchlist.length > 0 && (
                <span className="bg-emerald-500 text-black text-xs rounded-full px-1.5 py-0.5 font-semibold">
                  {watchlist.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-4 py-4 border-t border-zinc-900">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer text-sm"
          >
            {isDark ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                Switch to Light Mode
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
