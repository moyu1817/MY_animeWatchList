import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { searchAllAnime, getGenres } from '../services/anilistApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { dedupByMalId } from '../utils/anime'

const TYPES    = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']
const STATUSES = [
  { label: 'All',      value: '' },
  { label: 'Airing',   value: 'airing' },
  { label: 'Complete', value: 'complete' },
  { label: 'Upcoming', value: 'upcoming' },
]
const SORTS = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Score',      value: 'score' },
  { label: 'Newest',     value: 'newest' },
  { label: 'A–Z',        value: 'title' },
]

const btnBase     = 'px-3 py-1 rounded-md text-sm transition-colors cursor-pointer'
const btnActive   = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
const filterLabel = 'text-zinc-500 text-xs uppercase tracking-wide block mb-2'

export function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const urlGenre = searchParams.get('genre')

  const [type,        setType]        = useState('All')
  const [status,      setStatus]      = useState('')
  const [sort,        setSort]        = useState('popularity')
  const [genres,      setGenres]      = useState(() => urlGenre ? [urlGenre] : [])
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)

  usePageTitle(
    urlQuery      ? `Search: ${urlQuery}` :
    genres.length ? genres.join(', ')      : 'Browse'
  )

  useEffect(() => {
    if (urlGenre) setGenres([urlGenre])
  }, [urlGenre])

  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery)
    setType('All'); setStatus(''); setGenres([]); setSort('popularity')
  }

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: Infinity,
  })

  const allGenres = genresData?.data ?? []
  const typeParam = type === 'All' ? '' : type.toLowerCase()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['search-all', urlQuery, typeParam, status, genres, sort],
    queryFn:  ({ pageParam = 1 }) => searchAllAnime(urlQuery, pageParam, typeParam, status, genres, sort),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { has_next_page, current_page } = lastPage.pagination ?? {}
      return has_next_page ? (current_page ?? 1) + 1 : undefined
    },
  })

  const items       = useMemo(() => dedupByMalId(data?.pages.flatMap(p => p.data ?? []) ?? []), [data])
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage)

  function toggleGenre(name) {
    setGenres(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name])
  }

  function clearFilters() {
    setType('All'); setStatus(''); setGenres([]); setSort('popularity')
  }

  const hasActiveFilters = type !== 'All' || status !== '' || genres.length > 0 || sort !== 'popularity'

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">

      {/* Heading row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">
            {urlQuery
              ? <>Results for <span className="text-emerald-400">"{urlQuery}"</span></>
              : genres.length > 0
              ? <>Browsing <span className="text-emerald-400">{genres.join(' · ')}</span></>
              : 'Browse Anime'
            }
          </h1>
          {!isLoading && items.length > 0 && (
            <p className="text-zinc-600 text-sm mt-1">
              {items.length}{hasNextPage ? '+' : ''} anime loaded
            </p>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(f => !f)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Collapsible filters panel */}
      {filtersOpen && (
        <div className="space-y-5 mb-6 pb-5 border-b border-zinc-900">

          {/* Genre */}
          <div>
            <span className={filterLabel}>Genre</span>
            <div className="flex flex-wrap gap-2">
              {genresLoading
                ? Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="h-7 w-20 bg-zinc-900 border border-zinc-800 rounded-md animate-pulse" />
                  ))
                : allGenres.map(g => {
                    const isActive = genres.includes(g.name)
                    return (
                      <button
                        key={g.mal_id}
                        onClick={() => toggleGenre(g.name)}
                        className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
                      >
                        {g.name}{isActive && ' ×'}
                      </button>
                    )
                  })
              }
            </div>
          </div>

          {/* Type · Status · Sort — each with own label */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <span className={filterLabel}>Type</span>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)} className={`${btnBase} ${type === t ? btnActive : btnInactive}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <span className={filterLabel}>Status</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button key={s.value} onClick={() => setStatus(s.value)} className={`${btnBase} ${status === s.value ? btnActive : btnInactive}`}>{s.label}</button>
                ))}
              </div>
            </div>
            <div>
              <span className={filterLabel}>Sort by</span>
              <div className="flex flex-wrap gap-2">
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => setSort(s.value)} className={`${btnBase} ${sort === s.value ? btnActive : btnInactive}`}>{s.label}</button>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded-md text-sm text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 transition-colors cursor-pointer"
            >
              Clear all filters ×
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4">
        {isLoading
          ? Array.from({ length: 25 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
        }
        {isFetchingNextPage && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`next-${i}`} />)}
      </div>

      {!isLoading && items.length === 0 && (
        <p className="text-center text-zinc-600 py-12">No results found. Try adjusting your filters.</p>
      )}

      <div ref={sentinelRef} />
      {!isLoading && !hasNextPage && items.length > 0 && (
        <p className="text-center text-zinc-700 text-sm py-4">All {items.length} results loaded.</p>
      )}
    </div>
  )
}
