import { Link } from 'react-router-dom'
import { useWatchlist } from '../hooks/useWatchlist'
import { usePageTitle } from '../hooks/usePageTitle'

const STATUS_LABELS = { plan_to_watch: 'Plan to Watch', watching: 'Watching', completed: 'Completed', dropped: 'Dropped' }
const STATUS_COLORS = { plan_to_watch: 'bg-emerald-500', watching: 'bg-emerald-400', completed: 'bg-emerald-300', dropped: 'bg-zinc-600' }

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5 text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-zinc-400 text-sm mt-1">{label}</p>
      {sub && <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

export function Stats() {
  usePageTitle('My Stats')
  const { watchlist } = useWatchlist()

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-zinc-400 text-lg mb-2">No stats yet.</p>
        <p className="text-zinc-700 text-sm mb-6">Start adding anime to your watchlist to see your stats.</p>
        <Link to="/upcoming" className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-md text-sm font-semibold transition-colors">
          Browse Anime
        </Link>
      </div>
    )
  }

  const total = watchlist.length
  const completed = watchlist.filter(a => a.status === 'completed')
  const watching = watchlist.filter(a => a.status === 'watching')
  const totalEpisodes = completed.reduce((sum, a) => sum + (a.episodes ?? 0), 0)
  const estimatedHours = Math.round(totalEpisodes * 24 / 60)
  const estimatedDays = (estimatedHours / 24).toFixed(1)
  const rated = watchlist.filter(a => a.rating != null)
  const avgRating = rated.length ? (rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1) : null
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0

  // Status breakdown
  const statuses = ['plan_to_watch', 'watching', 'completed', 'dropped']
  const statusCounts = statuses.map(s => ({ status: s, count: watchlist.filter(a => a.status === s).length }))
  const maxStatusCount = Math.max(...statusCounts.map(s => s.count), 1)

  // Rating distribution
  const ratingDist = Array.from({ length: 10 }, (_, i) => ({
    score: 10 - i,
    count: watchlist.filter(a => a.rating === 10 - i).length,
  }))
  const maxRating = Math.max(...ratingDist.map(r => r.count), 1)

  // Recently added
  const recentlyAdded = [...watchlist]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 5)

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto page-fade">
      <h1 className="text-xl font-bold text-white mb-8">My Anime Stats</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Anime" value={total} />
        <StatCard label="Completed" value={completed.length} sub={`${completionRate}% completion`} />
        <StatCard label="Episodes Watched" value={completed.length > 0 ? totalEpisodes.toLocaleString() : '—'} sub={completed.length > 0 ? `~${estimatedHours} hrs / ${estimatedDays} days` : 'no completed anime yet'} />
        <StatCard label="Mean Score" value={avgRating ?? '—'} sub={rated.length ? `from ${rated.length} rated` : 'none rated yet'} />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Status breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
          <h2 className="text-base font-semibold text-white mb-5">Status Breakdown</h2>
          <div className="space-y-4">
            {statusCounts.map(({ status, count }) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">{STATUS_LABELS[status]}</span>
                  <span className="text-zinc-500">{count}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_COLORS[status]}`}
                    style={{ width: `${(count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
          <h2 className="text-base font-semibold text-white mb-5">My Rating Distribution</h2>
          {rated.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-6">Rate anime in your watchlist to see distribution.</p>
          ) : (
            <div className="space-y-2">
              {ratingDist.map(({ score, count }) => (
                <div key={score} className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs w-4 text-right">{score}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(count / maxRating) * 100}%` }}
                    />
                  </div>
                  <span className="text-zinc-600 text-xs w-4">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Currently watching */}
      {watching.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">Currently Watching ({watching.length})</h2>
          <div className="space-y-2">
            {watching.map(anime => (
              <Link
                key={anime.mal_id}
                to={`/anime/${anime.mal_id}`}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-md p-3 hover:border-emerald-500/30 transition-colors"
              >
                <img src={anime.image_url} alt={anime.title} className="w-8 h-11 object-cover rounded shrink-0 bg-zinc-800" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 11'%3E%3Crect width='8' height='11' fill='%2318181b'/%3E%3C/svg%3E" }} />
                <p className="text-white text-sm truncate flex-1">{anime.title}</p>
                {anime.score && <span className="text-emerald-500 text-xs shrink-0">★ {anime.score}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently added */}
      <div className="mb-10">
        <h2 className="text-base font-semibold text-white mb-4">Recently Added</h2>
        <div className="space-y-2">
          {recentlyAdded.map(anime => (
            <Link
              key={anime.mal_id}
              to={`/anime/${anime.mal_id}`}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-md p-3 hover:border-emerald-500/30 transition-colors"
            >
              <img src={anime.image_url} alt={anime.title} className="w-8 h-11 object-cover rounded shrink-0 bg-zinc-800" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 11'%3E%3Crect width='8' height='11' fill='%2318181b'/%3E%3C/svg%3E" }} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{anime.title}</p>
                <p className="text-zinc-600 text-xs mt-0.5">
                  Added {new Date(anime.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className="text-xs text-zinc-600 shrink-0 capitalize">{anime.status?.replace(/_/g, ' ')}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-zinc-600 text-sm">Keep tracking your anime journey</p>
        <div className="flex gap-2">
          <Link to="/watchlist" className="border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 px-4 py-2 rounded-md text-sm transition-colors">
            Manage Watchlist
          </Link>
          <Link to="/upcoming" className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-md text-sm font-semibold transition-colors">
            Discover Anime
          </Link>
        </div>
      </div>
    </div>
  )
}
