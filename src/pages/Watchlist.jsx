import { Link } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'
import { StatusBadge } from '../components/StatusBadge'

const STATUSES = ['plan_to_watch', 'watching', 'completed', 'dropped']

const STATUS_LABELS = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
}

const STAT_COLORS = {
  plan_to_watch: 'text-blue-400',
  watching: 'text-green-400',
  completed: 'text-purple-400',
  dropped: 'text-red-400',
}

function RatingPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-gray-600 text-xs mr-1">★</span>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-1.5 py-1 focus:outline-none focus:border-purple-500 cursor-pointer"
      >
        <option value="">—</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  )
}

export function Watchlist() {
  const { watchlist, removeAnime, updateStatus, updateRating } = useWatchlist()

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-gray-400 text-lg mb-2">Your watchlist is empty.</p>
        <p className="text-gray-600 text-sm mb-6">Start adding anime you want to watch!</p>
        <Link to="/upcoming" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          Browse Upcoming Anime
        </Link>
      </div>
    )
  }

  const stats = STATUSES.reduce((acc, s) => {
    acc[s] = watchlist.filter(a => a.status === s).length
    return acc
  }, {})

  const avgRating = (() => {
    const rated = watchlist.filter(a => a.rating !== null && a.rating !== undefined)
    if (!rated.length) return null
    return (rated.reduce((sum, a) => sum + a.rating, 0) / rated.length).toFixed(1)
  })()

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
        <span className="text-gray-500 text-sm">{watchlist.length} titles</span>
      </div>

      {/* Stats panel */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-4">
        {STATUSES.map(s => (
          <div key={s} className="text-center">
            <p className={`text-2xl font-bold ${STAT_COLORS[s]}`}>{stats[s]}</p>
            <p className="text-gray-500 text-xs mt-0.5">{STATUS_LABELS[s]}</p>
          </div>
        ))}
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">{avgRating ?? '—'}</p>
          <p className="text-gray-500 text-xs mt-0.5">Avg Score</p>
        </div>
      </div>

      {/* Grouped lists */}
      {STATUSES.map(status => {
        const group = watchlist.filter(a => a.status === status)
        if (group.length === 0) return null

        return (
          <section key={status} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={status} />
              <span className="text-gray-600 text-xs">({group.length})</span>
            </div>
            <div className="space-y-2">
              {group.map(anime => (
                <div key={anime.mal_id} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-colors">
                  <Link to={`/anime/${anime.mal_id}`} className="shrink-0">
                    <img src={anime.image_url} alt={anime.title} className="w-10 h-14 object-cover rounded" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/anime/${anime.mal_id}`} className="font-medium text-white hover:text-purple-400 text-sm block truncate transition-colors">
                      {anime.title}
                    </Link>
                    <div className="text-xs text-gray-600 mt-0.5 flex gap-2">
                      {anime.episodes && <span>{anime.episodes} eps</span>}
                      {anime.score && <span>★ {anime.score}</span>}
                    </div>
                  </div>
                  <RatingPicker value={anime.rating} onChange={r => updateRating(anime.mal_id, r)} />
                  <select
                    value={anime.status}
                    onChange={e => updateStatus(anime.mal_id, e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer shrink-0"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeAnime(anime.mal_id)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xl leading-none shrink-0 cursor-pointer"
                    title="Remove from watchlist"
                  >
                    ×
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
