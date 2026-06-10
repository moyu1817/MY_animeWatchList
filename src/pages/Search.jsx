import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { searchAllAnime, getGenres } from '../services/anilistApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'

const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']
const STATUSES = [
  { label: 'All',      value: '' },
  { label: 'Airing',   value: 'airing' },
  { label: 'Complete', value: 'complete' },
  { label: 'Upcoming', value: 'upcoming' },
]

const GENRE_COLORS = {
  'Action':        { bg: 'bg-red-950/60',     border: 'border-red-700/40',     text: 'text-red-300' },
  'Adventure':     { bg: 'bg-orange-950/60',  border: 'border-orange-700/40',  text: 'text-orange-300' },
  'Comedy':        { bg: 'bg-yellow-950/60',  border: 'border-yellow-700/40',  text: 'text-yellow-300' },
  'Drama':         { bg: 'bg-violet-950/60',  border: 'border-violet-700/40',  text: 'text-violet-300' },
  'Ecchi':         { bg: 'bg-pink-950/60',    border: 'border-pink-700/40',    text: 'text-pink-300' },
  'Fantasy':       { bg: 'bg-blue-950/60',    border: 'border-blue-700/40',    text: 'text-blue-300' },
  'Horror':        { bg: 'bg-red-950/80',     border: 'border-red-900/50',     text: 'text-red-400' },
  'Mahou Shoujo':  { bg: 'bg-rose-950/60',    border: 'border-rose-600/40',    text: 'text-rose-300' },
  'Mecha':         { bg: 'bg-slate-900/80',   border: 'border-slate-600/40',   text: 'text-slate-300' },
  'Music':         { bg: 'bg-cyan-950/60',    border: 'border-cyan-700/40',    text: 'text-cyan-300' },
  'Mystery':       { bg: 'bg-indigo-950/60',  border: 'border-indigo-700/40',  text: 'text-indigo-300' },
  'Psychological': { bg: 'bg-purple-950/60',  border: 'border-purple-700/40',  text: 'text-purple-300' },
  'Romance':       { bg: 'bg-rose-950/60',    border: 'border-rose-700/40',    text: 'text-rose-300' },
  'Sci-Fi':        { bg: 'bg-sky-950/60',     border: 'border-sky-700/40',     text: 'text-sky-300' },
  'Slice of Life': { bg: 'bg-emerald-950/60', border: 'border-emerald-700/40', text: 'text-emerald-300' },
  'Sports':        { bg: 'bg-amber-950/60',   border: 'border-amber-700/40',   text: 'text-amber-300' },
  'Supernatural':  { bg: 'bg-fuchsia-950/60', border: 'border-fuchsia-700/40', text: 'text-fuchsia-300' },
  'Thriller':      { bg: 'bg-zinc-900/80',    border: 'border-zinc-600/40',    text: 'text-zinc-300' },
}

const btnBase = 'px-3 py-1 rounded-md text-sm transition-colors cursor-pointer'
const btnActive = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
const paginationBtn = 'px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer disabled:cursor-default'

export function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const urlGenre = searchParams.get('genre')

  const [type,    setType]    = useState('All')
  const [status,  setStatus]  = useState('')
  const [genres,  setGenres]  = useState(() => urlGenre ? [urlGenre] : [])
  const [page,    setPage]    = useState(1)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)

  usePageTitle(
    urlQuery      ? `Search: ${urlQuery}` :
    genres.length ? genres.join(', ')      : 'Browse'
  )

  useEffect(() => {
    if (urlGenre) { setGenres([urlGenre]); setPage(1) }
  }, [urlGenre])

  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery)
    setPage(1); setType('All'); setStatus(''); setGenres([])
  }

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: Infinity,
  })

  const allGenres  = genresData?.data ?? []
  const typeParam  = type === 'All' ? '' : type.toLowerCase()

  const { data, isLoading } = useQuery({
    queryKey: ['search-all', urlQuery, typeParam, status, genres, page],
    queryFn:  () => searchAllAnime(urlQuery, page, typeParam, status, genres),
  })

  const items       = dedupByMalId(data?.data ?? [])
  const hasNextPage = data?.pagination?.has_next_page ?? false

  function toggleGenre(name) {
    setGenres(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name])
    setPage(1)
  }

  const hasActiveFilters = type !== 'All' || status !== '' || genres.length > 0

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">
          {urlQuery
            ? <>Results for <span className="text-emerald-400">"{urlQuery}"</span></>
            : genres.length > 0
            ? <>Browsing <span className="text-emerald-400">{genres.join(' · ')}</span></>
            : 'Popular Anime'
          }
        </h1>
        {!isLoading && items.length > 0 && (
          <p className="text-zinc-600 text-sm mt-1">{items.length} results on this page</p>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">

        {/* Genre chips — always visible */}
        <div>
          <span className="text-zinc-600 text-xs uppercase tracking-wide block mb-2">Category</span>
          <div className="flex flex-wrap gap-2">
            {genresLoading
              ? Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="h-7 w-20 bg-zinc-900 border border-zinc-800 rounded-md animate-pulse" />
                ))
              : allGenres.map(g => {
                  const isActive = genres.includes(g.name)
                  const c = GENRE_COLORS[g.name]
                  return (
                    <button
                      key={g.mal_id}
                      onClick={() => toggleGenre(g.name)}
                      className={`${btnBase} border ${
                        isActive && c
                          ? `${c.bg} ${c.border} ${c.text} font-medium`
                          : isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      {g.name}{isActive && ' ×'}
                    </button>
                  )
                })
            }
          </div>
        </div>

        {/* Type + Status + Clear */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Type</span>
            {TYPES.map(t => (
              <button key={t} onClick={() => { setType(t); setPage(1) }} className={`${btnBase} ${type === t ? btnActive : btnInactive}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Status</span>
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => { setStatus(s.value); setPage(1) }} className={`${btnBase} ${status === s.value ? btnActive : btnInactive}`}>{s.label}</button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setType('All'); setStatus(''); setGenres([]); setPage(1) }}
              className="px-3 py-1 rounded-md text-sm text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 transition-colors cursor-pointer self-center"
            >
              Clear filters ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
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
