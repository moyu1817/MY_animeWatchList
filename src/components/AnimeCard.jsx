import { Link } from 'react-router-dom'
import { WatchlistButton } from './WatchlistButton'

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%2318181b'/%3E%3C/svg%3E"

export function AnimeCard({ anime }) {
  const image = anime.images?.jpg?.large_image_url ?? anime.images?.jpg?.image_url
  const title = anime.title_english ?? anime.title
  const isAiring = anime.airing === true || anime.status === 'Currently Airing'

  return (
    <div className="bg-zinc-900 rounded-md overflow-hidden border border-zinc-800 transition-transform duration-150 hover:scale-105 hover:border-emerald-500/30 flex flex-col relative">
      {isAiring && (
        <span className="absolute top-2 right-2 z-10 bg-emerald-500 text-black text-xs font-bold px-1.5 py-0.5 rounded">
          Airing
        </span>
      )}
      <Link to={`/anime/${anime.mal_id}`}>
        <img
          src={image}
          alt={title}
          className="w-full aspect-[3/4] object-cover"
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK }}
        />
      </Link>
      <div className="p-3 h-32 grid grid-rows-[auto_1fr_auto] overflow-hidden">
        <Link
          to={`/anime/${anime.mal_id}`}
          className="font-medium text-sm text-white hover:text-emerald-400 line-clamp-2 transition-colors"
        >
          {title}
        </Link>
        <div className="self-end pb-1.5 text-xs text-zinc-600 flex gap-2 flex-wrap">
          {anime.type && <span>{anime.type}</span>}
          {!!anime.episodes && <span>{anime.episodes} eps</span>}
          {anime.score && <span className="text-emerald-500">★ {anime.score}</span>}
        </div>
        <WatchlistButton anime={{
          mal_id: anime.mal_id,
          title,
          image_url: image,
          score: anime.score ?? null,
          episodes: anime.episodes ?? null,
        }} />
      </div>
    </div>
  )
}
