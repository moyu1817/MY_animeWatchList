import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { searchAllAnime, getGenres } from '../services/jikanApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'


const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']
const STATUSES = [
  { label: 'All', value: '' },
  { label: 'Airing', value: 'airing' },
  { label: 'Complete', value: 'complete' },
  { label: 'Upcoming', value: 'upcoming' },
]

const btnBase = 'px-3 py-1 rounded-md text-sm transition-colors cursor-pointer'
const btnActive = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'

export function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  usePageTitle(urlQuery ? `Search: ${urlQuery}` : 'Browse')

  const [type, setType] = useState('All')
  const [status, setStatus] = useState('')
  const [genre, setGenre] = useState(null)
  const [page, setPage] = useState(1)
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
    queryKey: ['search-all', urlQuery, typeParam, status, genre?.mal_id ?? null, page],
    queryFn: () => searchAllAnime(urlQuery, page, typeParam, status, genre?.mal_id ?? null),
    enabled: hasFilter,
  })

  const items = dedupByMalId(data?.data ?? [])
  const total = data?.pagination?.items?.total ?? 0
  const lastPage = data?.pagination?.last_visible_page ?? 1

  function setFilter(setter) {
    return (value) => { setter(value); setPage(1) }
  }

  function toggleGenre(g) {
    setGenre(prev => prev?.mal_id === g.mal_id ? null : g)
    setPage(1)
  }

  const paginationBtn = 'px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer disabled:cursor-default'

  if (!hasFilter) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
        <h1 className="text-xl font-bold text-white mb-2">Browse by Category</h1>
        <p className="text-zinc-600 text-sm mb-6">Select a genre or type in the search bar.</p>
        <div className="flex flex-wrap gap-2">
          {genresLoading
            ? Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-zinc-900 border border-zinc-800 rounded-md animate-pulse"
                  style={{ width: `${['72px','88px','64px','96px','80px'][i % 5]}` }}
                />
              ))
            : allGenres.map(g => (
                <button
                  key={g.mal_id}
                  onClick={() => toggleGenre(g)}
                  className="px-3 py-1.5 rounded-md text-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500/40 transition-colors cursor-pointer"
                >
                  {g.name}
                  <span className="ml-1.5 text-zinc-700 text-xs">{g.count?.toLocaleString()}</span>
                </button>
              ))
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
        {!isLoading && total > 0 && (
          <p className="text-zinc-600 text-sm mt-1">{total.toLocaleString()} anime found</p>
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
                className={`${btnBase} ${genre?.mal_id === g.mal_id ? btnActive : btnInactive}`}
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
          <span className="text-zinc-500 text-sm">Page {page} of {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className={paginationBtn}>Next →</button>
        </div>
      )}
    </div>
  )
}
