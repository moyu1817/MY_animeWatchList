import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'
import { StatusBadge } from '../components/StatusBadge'
import { usePageTitle } from '../hooks/usePageTitle'
import { STATUSES, STATUS_LABELS } from '../utils/watchlistStatus'
const STAT_COLORS = { plan_to_watch: 'text-emerald-400', watching: 'text-emerald-300', completed: 'text-emerald-500', dropped: 'text-zinc-600' }

const SORT_OPTIONS = [
  { value: 'date', label: 'Date Added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'score', label: 'MAL Score' },
  { value: 'rating', label: 'My Rating' },
]

function RatingPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-zinc-600 text-xs">Rate</span>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-md px-1.5 py-1 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
      >
        <option value="">—</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  )
}

function sortGroup(group, sortBy) {
  return [...group].sort((a, b) => {
    if (sortBy === 'title') return (a.title ?? '').localeCompare(b.title ?? '')
    if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0)
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
    return new Date(b.addedAt) - new Date(a.addedAt)
  })
}

export function Watchlist() {
  usePageTitle('My Watchlist')
  const { watchlist, removeAnime, updateStatus, updateRating, importWatchlist } = useWatchlist()
  const [sortBy, setSortBy] = useState('date')
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const confirmTimer = useRef(null)
  const importRef = useRef(null)

  useEffect(() => () => clearTimeout(confirmTimer.current), [])

  function handleRemove(mal_id) {
    if (confirmId === mal_id) {
      removeAnime(mal_id)
      setConfirmId(null)
    } else {
      clearTimeout(confirmTimer.current)
      setConfirmId(mal_id)
      confirmTimer.current = setTimeout(() => setConfirmId(id => id === mal_id ? null : id), 3000)
    }
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error('Invalid format')
        importWatchlist(data)
      } catch {
        alert('Invalid watchlist file. Make sure it is a JSON exported from MoMoAnime.')
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(watchlist, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-watchlist.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-zinc-400 text-lg mb-2">Your watchlist is empty.</p>
        <p className="text-zinc-700 text-sm mb-6">Start adding anime you want to watch!</p>
        <Link to="/featured" className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-md text-sm font-semibold transition-colors">
          Discover Anime
        </Link>
      </div>
    )
  }

  const stats = STATUSES.reduce((acc, s) => { acc[s] = watchlist.filter(a => a.status === s).length; return acc }, {})
  const avgRating = (() => {
    const rated = watchlist.filter(a => a.rating != null)
    if (!rated.length) return null
    return (rated.reduce((sum, a) => sum + a.rating, 0) / rated.length).toFixed(1)
  })()

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto page-fade">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">My Watchlist</h1>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-sm">{watchlist.length} titles</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={handleExport} className="border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer shrink-0">
            Export
          </button>
          <button onClick={() => importRef.current?.click()} className="border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer shrink-0">
            Import
          </button>
          <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Filter by title..."
        className="w-full sm:w-72 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors mb-6"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 bg-zinc-900 border border-zinc-800 rounded-md p-4">
        {STATUSES.map(s => (
          <div key={s} className="text-center">
            <p className={`text-2xl font-bold ${STAT_COLORS[s]}`}>{stats[s]}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{STATUS_LABELS[s]}</p>
          </div>
        ))}
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{avgRating ?? '—'}</p>
          <p className="text-zinc-600 text-xs mt-0.5">Avg Score</p>
        </div>
      </div>

      {STATUSES.map(status => {
        const base = search.trim() ? watchlist.filter(a => a.title?.toLowerCase().includes(search.toLowerCase().trim())) : watchlist
        const group = sortGroup(base.filter(a => a.status === status), sortBy)
        if (group.length === 0) return null
        return (
          <section key={status} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={status} />
              <span className="text-zinc-700 text-xs">({group.length})</span>
            </div>
            <div className="space-y-2">
              {group.map(anime => (
                <div key={anime.mal_id} className="flex items-center gap-3 bg-zinc-900 rounded-md p-3 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <Link to={`/anime/${anime.mal_id}`} className="shrink-0">
                    <img src={anime.image_url} alt={anime.title} className="w-10 h-14 object-cover rounded bg-zinc-800" referrerPolicy="no-referrer" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 7'%3E%3Crect width='5' height='7' fill='%2318181b'/%3E%3C/svg%3E" }} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/anime/${anime.mal_id}`} className="font-medium text-white hover:text-emerald-400 text-sm block truncate transition-colors">
                      {anime.title}
                    </Link>
                    <div className="text-xs text-zinc-600 mt-0.5 flex gap-2">
                      {anime.episodes && <span>{anime.episodes} eps</span>}
                      {anime.score && <span>★ {anime.score}</span>}
                    </div>
                  </div>
                  <RatingPicker value={anime.rating} onChange={r => updateRating(anime.mal_id, r)} />
                  <select
                    value={anime.status}
                    onChange={e => updateStatus(anime.mal_id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer shrink-0"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <button
                    onClick={() => handleRemove(anime.mal_id)}
                    className={`text-xs font-medium shrink-0 cursor-pointer transition-colors px-2 py-1 rounded ${confirmId === anime.mal_id ? 'text-red-400 border border-red-500/40 hover:bg-red-500/10' : 'text-zinc-700 hover:text-red-400'}`}
                    title="Remove"
                  >
                    {confirmId === anime.mal_id ? 'Sure?' : '×'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
