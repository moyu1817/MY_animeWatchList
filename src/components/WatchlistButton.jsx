import { useWatchlist } from '../hooks/useWatchlist'

export function WatchlistButton({ anime }) {
  const { isInWatchlist, addAnime, removeAnime } = useWatchlist()
  const inList = isInWatchlist(anime.mal_id)

  return (
    <button
      onClick={() => inList ? removeAnime(anime.mal_id) : addAnime(anime)}
      className={`w-full py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
        inList
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
          : 'bg-purple-600 hover:bg-purple-500 text-white border border-transparent'
      }`}
    >
      {inList ? '✓ In Watchlist' : '+ Add to Watchlist'}
    </button>
  )
}
