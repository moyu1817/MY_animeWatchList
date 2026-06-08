import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAnimeById, getAnimeCharacters, getAnimeRecommendations } from '../services/jikanApi'
import { WatchlistButton } from '../components/WatchlistButton'
import { AnimeCard } from '../components/AnimeCard'

const TABS = ['Overview', 'Characters', 'Recommendations']

export function AnimeDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')

  const { data: anime, isLoading, isError } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => getAnimeById(id),
  })
  const { data: characters = [] } = useQuery({
    queryKey: ['anime-characters', id],
    queryFn: () => getAnimeCharacters(id),
    enabled: tab === 'Characters',
  })
  const { data: recommendations = [] } = useQuery({
    queryKey: ['anime-recommendations', id],
    queryFn: () => getAnimeRecommendations(id),
    enabled: tab === 'Recommendations',
  })

  if (isLoading) {
    return (
      <div className="px-4 py-8 max-w-5xl mx-auto animate-pulse">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="w-48 aspect-[3/4] bg-zinc-900 rounded-md shrink-0" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-8 bg-zinc-900 rounded w-2/3" />
            <div className="h-4 bg-zinc-900 rounded w-1/3" />
            <div className="h-32 bg-zinc-900 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !anime) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-600 mb-4">Anime not found.</p>
        <Link to="/" className="text-emerald-400 hover:text-emerald-300 text-sm">← Go back</Link>
      </div>
    )
  }

  const title = anime.title_english ?? anime.title
  const image = anime.images?.jpg?.large_image_url

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <Link to="/" className="text-zinc-600 hover:text-white text-sm mb-6 inline-block transition-colors">← Back</Link>

      <div className="flex flex-col sm:flex-row gap-8 mt-2">
        <div className="shrink-0">
          <img src={image} alt={title} className="w-48 rounded-md border border-zinc-800" />
          <div className="mt-3 w-48">
            <WatchlistButton anime={{ mal_id: anime.mal_id, title, image_url: image, score: anime.score ?? null, episodes: anime.episodes ?? null }} />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{title}</h1>
          {anime.title !== title && <p className="text-zinc-600 text-sm mb-3">{anime.title}</p>}

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.score && (
              <span className="bg-zinc-900 text-emerald-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">★ {anime.score}</span>
            )}
            {anime.status && (
              <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">{anime.status}</span>
            )}
            {anime.type && (
              <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">{anime.type}</span>
            )}
            {anime.episodes && (
              <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">{anime.episodes} eps</span>
            )}
          </div>

          {anime.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map(g => (
                <span key={g.mal_id} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-xs">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {anime.synopsis && (
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">{anime.synopsis}</p>
          )}

          <div className="space-y-1 text-sm">
            {anime.studios?.length > 0 && (
              <p className="text-zinc-600">Studio: <span className="text-zinc-300">{anime.studios.map(s => s.name).join(', ')}</span></p>
            )}
            {anime.aired?.from && (
              <p className="text-zinc-600">Airing: <span className="text-zinc-300">{new Date(anime.aired.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            )}
            {anime.duration && (
              <p className="text-zinc-600">Duration: <span className="text-zinc-300">{anime.duration}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 border-b border-zinc-900 flex gap-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              tab === t
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && anime.trailer?.embed_url && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-white mb-4">Trailer</h2>
          <div className="aspect-video rounded-xl overflow-hidden max-w-2xl border border-zinc-900">
            <iframe src={anime.trailer.embed_url} title={`${title} trailer`} className="w-full h-full" allowFullScreen />
          </div>
        </div>
      )}

      {tab === 'Characters' && (
        <div className="mt-8">
          {characters.length === 0 ? (
            <p className="text-zinc-600 py-8 text-center">No character data available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {characters.slice(0, 24).map(({ character, role, voice_actors }) => {
                const jpVA = voice_actors?.find(v => v.language === 'Japanese')
                return (
                  <div key={character.mal_id} className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden flex gap-3 p-3 items-start">
                    <img src={character.images?.jpg?.image_url} alt={character.name} className="w-12 h-16 object-cover rounded shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{character.name}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">{role}</p>
                      {jpVA && <p className="text-emerald-400 text-xs mt-1 truncate">{jpVA.person.name}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'Recommendations' && (
        <div className="mt-8">
          {recommendations.length === 0 ? (
            <p className="text-zinc-600 py-8 text-center">No recommendations available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.slice(0, 20).map(({ entry, votes }) => (
                <div key={entry.mal_id} className="relative">
                  <AnimeCard anime={{ ...entry, title: entry.title, images: entry.images }} />
                  {votes > 0 && (
                    <span className="absolute top-2 right-2 bg-black/80 text-emerald-400 text-xs px-1.5 py-0.5 rounded">
                      {votes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
