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

const btnBase     = 'px-3 py-1 rounded-md text-sm transition-colors cursor-pointer'
const btnActive   = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'

export function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const urlGenre = searchParams.get('genre')

  const [type,   setType]   = useState('All')
  const [status, setStatus] = useState('')
  const [genres, setGenres] = useState(() => urlGenre ? [urlGenre] : [])
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
    setType('All'); setStatus(''); setGenres([])
  }

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: Infinity,
  })

  const allGenres = genresData?.data ?? []
  const typeParam = type === 'All' ? '' : type.toLowerCase()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['search-all', urlQuery, typeParam, status, genres],
    queryFn:  ({ pageParam = 1 }) => searchAllAnime(urlQuery, pageParam, typeParam, status, genres),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { has_next_page, current_page } = lastPage.pagination ?? {}
      return has_next_page ? (current_page ?? 1) + 1 : undefined
    },
  })

  const items       = useMemo(() => dedupByMalId(data?.pages.flatMap(p => p.data ?? []) ?? []), [data])
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage)
  const total       = data?.pages?.[0]?.pagination?.items?.total ?? null

  function toggleGenre(name) {
    setGenres(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name])
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
        {!isLoading && total !== null && (
          <p className="text-zinc-600 text-sm mt-1">{total.toLocaleString()} results</p>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">

        {/* Genre chips */}
        <div>
          <span className="text-zinc-600 text-xs uppercase tracking-wide block mb-2">Category</span>
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

        {/* Type + Status + Clear */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Type</span>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} className={`${btnBase} ${type === t ? btnActive : btnInactive}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Status</span>
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setStatus(s.value)} className={`${btnBase} ${status === s.value ? btnActive : btnInactive}`}>{s.label}</button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setType('All'); setStatus(''); setGenres([]) }}
              className="px-3 py-1 rounded-md text-sm text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 transition-colors cursor-pointer self-center"
            >
              Clear filters ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
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
