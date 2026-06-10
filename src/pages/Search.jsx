import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { searchAllAnime, getGenres } from '../services/anilistApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'


const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']
const STATUSES = [
  { label: 'All', value: '' },
  { label: 'Airing', value: 'airing' },
  { label: 'Complete', value: 'complete' },
  { label: 'Upcoming', value: 'upcoming' },
]

const GENRE_COLORS = {
  'Action':        { bg: 'bg-red-950/60',      border: 'border-red-700/30',      text: 'text-red-300',      dot: 'bg-red-500' },
  'Adventure':     { bg: 'bg-orange-950/60',   border: 'border-orange-700/30',   text: 'text-orange-300',   dot: 'bg-orange-500' },
  'Comedy':        { bg: 'bg-yellow-950/60',   border: 'border-yellow-700/30',   text: 'text-yellow-300',   dot: 'bg-yellow-500' },
  'Drama':         { bg: 'bg-violet-950/60',   border: 'border-violet-700/30',   text: 'text-violet-300',   dot: 'bg-violet-500' },
  'Ecchi':         { bg: 'bg-pink-950/60',     border: 'border-pink-700/30',     text: 'text-pink-300',     dot: 'bg-pink-400' },
  'Fantasy':       { bg: 'bg-blue-950/60',     border: 'border-blue-700/30',     text: 'text-blue-300',     dot: 'bg-blue-500' },
  'Horror':        { bg: 'bg-red-950/80',      border: 'border-red-900/40',      text: 'text-red-400',      dot: 'bg-red-700' },
  'Mahou Shoujo':  { bg: 'bg-rose-950/60',     border: 'border-rose-600/30',     text: 'text-rose-300',     dot: 'bg-rose-400' },
  'Mecha':         { bg: 'bg-slate-900/80',    border: 'border-slate-600/30',    text: 'text-slate-300',    dot: 'bg-slate-500' },
  'Music':         { bg: 'bg-cyan-950/60',     border: 'border-cyan-700/30',     text: 'text-cyan-300',     dot: 'bg-cyan-500' },
  'Mystery':       { bg: 'bg-indigo-950/60',   border: 'border-indigo-700/30',   text: 'text-indigo-300',   dot: 'bg-indigo-500' },
  'Psychological': { bg: 'bg-purple-950/60',   border: 'border-purple-700/30',   text: 'text-purple-300',   dot: 'bg-purple-500' },
  'Romance':       { bg: 'bg-rose-950/60',     border: 'border-rose-700/30',     text: 'text-rose-300',     dot: 'bg-rose-500' },
  'Sci-Fi':        { bg: 'bg-sky-950/60',      border: 'border-sky-700/30',      text: 'text-sky-300',      dot: 'bg-sky-500' },
  'Slice of Life': { bg: 'bg-emerald-950/60',  border: 'border-emerald-700/30',  text: 'text-emerald-300',  dot: 'bg-emerald-500' },
  'Sports':        { bg: 'bg-amber-950/60',    border: 'border-amber-700/30',    text: 'text-amber-300',    dot: 'bg-amber-500' },
  'Supernatural':  { bg: 'bg-fuchsia-950/60',  border: 'border-fuchsia-700/30',  text: 'text-fuchsia-300',  dot: 'bg-fuchsia-500' },
  'Thriller':      { bg: 'bg-zinc-900/80',     border: 'border-zinc-600/30',     text: 'text-zinc-300',     dot: 'bg-zinc-500' },
}
const GENRE_DEFAULT = { bg: 'bg-zinc-900/60', border: 'border-zinc-700/30', text: 'text-zinc-300', dot: 'bg-zinc-500' }

const btnBase = 'px-3 py-1 rounded-md text-sm transition-colors cursor-pointer'
const btnActive = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'

export function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const urlGenre = searchParams.get('genre')
  usePageTitle(urlQuery ? `Search: ${urlQuery}` : urlGenre ? `Genre: ${urlGenre}` : 'Browse')

  const [type, setType] = useState('All')
  const [status, setStatus] = useState('')
  const [genre, setGenre] = useState(() => urlGenre ? { mal_id: 0, name: urlGenre } : null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (urlGenre) {
      setGenre({ mal_id: 0, name: urlGenre })
      setPage(1)
    }
  }, [urlGenre])
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)

  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery)
    setPage(1)
    setType('All')
    setStatus('')
    setGenre(null)
    setShowAllGenres(false)
  }

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: Infinity,
  })

  const allGenres = genresData?.data ?? []
  const visibleGenres = showAllGenres ? allGenres : allGenres.slice(0, 16)
  const typeParam = type === 'All' ? '' : type.toLowerCase()
  const hasFilter = urlQuery.length > 0 || genre !== null

  const { data, isLoading } = useQuery({
    queryKey: ['search-all', urlQuery, typeParam, status, genre?.name ?? null, page],
    queryFn: () => searchAllAnime(urlQuery, page, typeParam, status, genre?.name ?? null),
    enabled: hasFilter,
  })

  const items = dedupByMalId(data?.data ?? [])
  const hasNextPage = data?.pagination?.has_next_page ?? false



  function setFilter(setter) {
    return (value) => { setter(value); setPage(1) }
  }

  function toggleGenre(g) {
    setGenre(prev => prev?.name === g.name ? null : g)
    setPage(1)
  }

  const paginationBtn = 'px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer disabled:cursor-default'

  if (!hasFilter) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
        <h1 className="text-xl font-bold text-white mb-1">Browse by Category</h1>
        <p className="text-zinc-600 text-sm mb-8">Pick a genre to explore anime.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {genresLoading
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="h-20 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
              ))
            : allGenres.map(g => {
                const c = GENRE_COLORS[g.name] ?? GENRE_DEFAULT
                return (
                  <Link
                    key={g.mal_id}
                    to={`/search?genre=${encodeURIComponent(g.name)}`}
                    className={`${c.bg} ${c.border} border rounded-xl p-4 flex flex-col gap-2.5 hover:brightness-125 transition-all cursor-pointer`}
                  >
                    <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className={`font-semibold text-sm ${c.text}`}>{g.name}</span>
                  </Link>
                )
              })
          }
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">
          {urlQuery
            ? <>Results for <span className="text-emerald-400">"{urlQuery}"</span></>
            : <>Browsing <span className="text-emerald-400">{genre?.name}</span></>
          }
        </h1>
        {!isLoading && items.length > 0 && (
          <p className="text-zinc-600 text-sm mt-1">{items.length} results on this page</p>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Category</span>
            {genre && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {genre.name} ×
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleGenres.map(g => (
              <button
                key={g.mal_id}
                onClick={() => toggleGenre(g)}
                className={`${btnBase} ${genre?.name === g.name ? btnActive : btnInactive}`}
              >
                {g.name}
              </button>
            ))}
            {allGenres.length > 16 && (
              <button
                onClick={() => setShowAllGenres(v => !v)}
                className="px-3 py-1 rounded-md text-sm text-emerald-400 hover:text-emerald-300 border border-zinc-800 bg-zinc-900 cursor-pointer transition-colors"
              >
                {showAllGenres ? 'Show less ↑' : `+${allGenres.length - 16} more ↓`}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Type</span>
            {TYPES.map(t => (
              <button key={t} onClick={() => setFilter(setType)(t)} className={`${btnBase} ${type === t ? btnActive : btnInactive}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Status</span>
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setFilter(setStatus)(s.value)} className={`${btnBase} ${status === s.value ? btnActive : btnInactive}`}>{s.label}</button>
            ))}
          </div>
          {(type !== 'All' || status !== '' || genre !== null) && (
            <button
              onClick={() => { setType('All'); setStatus(''); setGenre(null); setPage(1) }}
              className="px-3 py-1 rounded-md text-sm text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 transition-colors cursor-pointer self-center"
            >
              Clear filters ×
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
        }
      </div>

      {!isLoading && items.length === 0 && (
        <p className="text-center text-zinc-600 py-12">No results found. Try adjusting your filters.</p>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={paginationBtn}>← Prev</button>
          <span className="text-zinc-500 text-sm">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage} className={paginationBtn}>Next →</button>
        </div>
      )}
    </div>
  )
}
