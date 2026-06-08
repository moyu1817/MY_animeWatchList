import { useWatchlist } from '../hooks/useWatchlist'

export function WatchlistButton({ anime }) {
  const { isInWatchlist, addAnime, removeAnime } = useWatchlist()
  const inList = isInWatchlist(anime.mal_id)

  return (
    <button
      onClick={() => inList ? removeAnime(anime.mal_id) : addAnime(anime)}
      className={`w-full py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
        inList
          ? 'border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
          : 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold'
      }`}
    >
      {inList ? '✓ In Watchlist' : '+ Add to Watchlist'}
    </button>
  )
}
