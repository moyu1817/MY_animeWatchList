import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAnimeById, getAnimeCharacters, getAnimeRecommendations, getAnimeNews } from '../services/jikanApi'
import { WatchlistButton } from '../components/WatchlistButton'
import { AnimeCard } from '../components/AnimeCard'
import { TrailerModal } from '../components/TrailerModal'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { usePageTitle } from '../hooks/usePageTitle'

const TABS = ['Overview', 'Characters', 'Recommendations', 'News']

export function AnimeDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')
  const [showTrailer, setShowTrailer] = useState(false)
  const [copied, setCopied] = useState(false)
  const { addToRecent } = useRecentlyViewed()
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
  const { data: news = [] } = useQuery({
    queryKey: ['anime-news', id],
    queryFn: () => getAnimeNews(id),
    enabled: tab === 'News',
  })

  usePageTitle(anime ? (anime.title_english ?? anime.title) : null)

  useEffect(() => {
    if (anime) addToRecent(anime)
  }, [anime])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShareX() {
    const t = anime?.title_english ?? anime?.title
    window.open(`https://x.com/intent/tweet?text=Check out ${encodeURIComponent(t)} on MoMoAnime!&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="w-full h-56 md:h-72 bg-zinc-900" />
        <div className="px-4 max-w-5xl mx-auto -mt-16 relative flex gap-8">
          <div className="w-44 aspect-[3/4] bg-zinc-800 rounded-md shrink-0" />
          <div className="flex-1 pt-20 space-y-3">
            <div className="h-8 bg-zinc-800 rounded w-2/3" />
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-24 bg-zinc-800 rounded" />
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
  const banner = anime.images?.jpg?.large_image_url

  return (
    <div className="page-fade">
      {/* Cinematic banner */}
      <div className="relative w-full h-56 md:h-80 overflow-hidden">
        <img
          src={banner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: 'blur(22px) brightness(0.25)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Content overlapping banner */}
      <div className="px-4 max-w-5xl mx-auto -mt-36 relative pb-10">
        <Link to="/" className="text-zinc-500 hover:text-white text-sm mb-6 inline-block transition-colors">← Back</Link>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Poster */}
          <div className="shrink-0">
            <img
              src={image}
              alt={title}
              className="w-44 rounded-md border border-zinc-800 shadow-2xl shadow-black"
            />
            <div className="mt-3 w-44 space-y-2">
              <WatchlistButton anime={{ mal_id: anime.mal_id, title, image_url: image, score: anime.score ?? null, episodes: anime.episodes ?? null }} />
              {anime.trailer?.embed_url && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="w-full py-1.5 rounded-md text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  ▶ Watch Trailer
                </button>
              )}
              <div className="flex gap-2">
                <button onClick={handleShare} className="flex-1 py-1.5 rounded-md text-xs border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer">
                  {copied ? '✓ Copied!' : '🔗 Copy'}
                </button>
                <button onClick={handleShareX} className="flex-1 py-1.5 rounded-md text-xs border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer">
                  𝕏 Share
                </button>
              </div>
            </div>
          </div>

          {/* Info — pushed down so title clears the banner */}
          <div className="flex-1 pt-2 sm:pt-14">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{title}</h1>
            {anime.title !== title && <p className="text-zinc-600 text-sm mb-3">{anime.title}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {anime.score && <span className="bg-zinc-900/80 text-emerald-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">★ {anime.score}</span>}
              {anime.status && <span className="bg-zinc-900/80 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">{anime.status}</span>}
              {anime.type && <span className="bg-zinc-900/80 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">{anime.type}</span>}
              {anime.episodes && <span className="bg-zinc-900/80 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded-md text-sm">{anime.episodes} eps</span>}
            </div>

            {anime.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres.map(g => (
                  <span key={g.mal_id} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-xs">{g.name}</span>
                ))}
              </div>
            )}

            {anime.synopsis && <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-4">{anime.synopsis}</p>}

            <div className="space-y-1 text-sm">
              {anime.studios?.length > 0 && <p className="text-zinc-600">Studio: <span className="text-zinc-300">{anime.studios.map(s => s.name).join(', ')}</span></p>}
              {anime.aired?.from && <p className="text-zinc-600">Airing: <span className="text-zinc-300">{new Date(anime.aired.from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              {anime.duration && <p className="text-zinc-600">Duration: <span className="text-zinc-300">{anime.duration}</span></p>}
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
                tab === t ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && anime.trailer?.embed_url && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Trailer</h2>
              <button onClick={() => setShowTrailer(true)} className="text-emerald-400 hover:text-emerald-300 text-sm cursor-pointer transition-colors">Open fullscreen ↗</button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden max-w-2xl border border-zinc-900">
              <iframe src={anime.trailer.embed_url} title={`${title} trailer`} className="w-full h-full" allowFullScreen />
            </div>
          </div>
        )}

        {/* Characters */}
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

        {/* Recommendations */}
        {tab === 'Recommendations' && (
          <div className="mt-8">
            {recommendations.length === 0 ? (
              <p className="text-zinc-600 py-8 text-center">No recommendations available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendations.slice(0, 20).map(({ entry, votes }) => (
                  <div key={entry.mal_id} className="relative">
                    <AnimeCard anime={{ ...entry, title: entry.title, images: entry.images }} />
                    {votes > 0 && <span className="absolute top-2 right-2 bg-black/80 text-emerald-400 text-xs px-1.5 py-0.5 rounded">{votes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* News */}
        {tab === 'News' && (
          <div className="mt-8 space-y-4">
            {news.length === 0 ? (
              <p className="text-zinc-600 py-8 text-center">No news available.</p>
            ) : (
              news.slice(0, 15).map(article => (
                <a key={article.mal_id} href={article.url} target="_blank" rel="noopener noreferrer"
                  className="flex gap-4 bg-zinc-900 border border-zinc-800 rounded-md p-4 hover:border-emerald-500/30 transition-colors group"
                >
                  {article.images?.jpg?.image_url && (
                    <img src={article.images.jpg.image_url} alt="" className="w-20 h-14 object-cover rounded shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors line-clamp-2">{article.title}</p>
                    <p className="text-zinc-600 text-xs mt-1">{article.author_username} · {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    {article.excerpt && <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{article.excerpt}</p>}
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>

      {showTrailer && anime.trailer?.embed_url && (
        <TrailerModal embedUrl={anime.trailer.embed_url} title={title} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  )
}
