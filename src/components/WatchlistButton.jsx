import { useWatchlist } from '../hooks/useWatchlist'
import { useToast } from '../context/ToastContext'

export function WatchlistButton({ anime, className }) {
  const { isInWatchlist, addAnime, removeAnime } = useWatchlist()
  const { addToast } = useToast()
  const inList = isInWatchlist(anime.mal_id)

  function handleClick() {
    if (inList) {
      removeAnime(anime.mal_id)
      addToast('Removed from watchlist', 'remove')
    } else {
      addAnime(anime)
      addToast(`Added to watchlist`, 'success')
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={inList ? `Remove ${anime.title} from watchlist` : `Add ${anime.title} to watchlist`}
      aria-pressed={inList}
      className={`${className ?? 'w-full'} py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
        inList
          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
          : 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold'
      }`}
    >
      {inList ? '✓ In Watchlist' : '+ Add to Watchlist'}
    </button>
  )
}
