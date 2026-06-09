import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { useDebounce } from '../hooks/useDebounce'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { getUpcomingAnime, searchAnime, searchAllAnime } from '../services/jikanApi'
import { usePageTitle } from '../hooks/usePageTitle'

const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']

const btnBase = 'px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer'
const btnActive = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'

export function Upcoming() {
  usePageTitle('Upcoming Anime')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [searchParams, setSearchParams] = useSearchParams()
  const debouncedSearch = useDebounce(search, 400)
  const isSearching = debouncedSearch.trim().length > 0
  const genreId = searchParams.get('genre_id')
  const genreName = searchParams.get('genre')
  const isGenreFilter = !!genreId && !isSearching

  function clearGenre() {
    searchParams.delete('genre_id')
    searchParams.delete('genre')
    setSearchParams(searchParams)
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: isSearching
      ? ['upcoming-search', debouncedSearch]
      : isGenreFilter
        ? ['upcoming-genre', genreId]
        : ['upcoming-infinite'],
    queryFn: ({ pageParam }) => {
      if (isSearching) return searchAnime(debouncedSearch, pageParam)
      if (isGenreFilter) return searchAllAnime('', pageParam, '', 'upcoming', genreId)
      return getUpcomingAnime(pageParam)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_visible_page } = lastPage.pagination ?? {}
      return current_page < last_visible_page ? current_page + 1 : undefined
    },
  })

  const seen = new Set()
  const allItems = (data?.pages.flatMap(p => p.data) ?? []).filter(a => seen.has(a.mal_id) ? false : seen.add(a.mal_id))
  const items = allItems.filter(a => type === 'All' || a.type === type)
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage)

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
      <h1 className="text-xl font-bold text-white mb-6">Upcoming Anime</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search upcoming anime..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-white rounded-md px-4 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors w-full sm:w-72"
        />
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} className={`${btnBase} ${type === t ? btnActive : btnInactive}`}>
              {t}
            </button>
          ))}
        </div>
        {isGenreFilter && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-3 py-1.5 rounded-md">
            <span>Genre: {genreName}</span>
            <button onClick={clearGenre} className="hover:text-white transition-colors leading-none cursor-pointer ml-1">Ã—</button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((anime, i) => <AnimeCard key={`${anime.mal_id}-${i}`} anime={anime} />)
        }
        {isFetchingNextPage && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`next-${i}`} />)}
      </div>

      {!isLoading && allItems.length > 0 && items.length === 0 && (
        <p className="text-center text-zinc-600 py-12">
          No {type} in the loaded results.{hasNextPage ? ' Scroll to load more, or ' : ' '}
          <button onClick={() => setType('All')} className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">clear the filter</button>.
        </p>
      )}
      {!isLoading && allItems.length === 0 && (
        <p className="text-center text-zinc-600 py-12">No anime found.</p>
      )}

      <div ref={sentinelRef} />
      {!isLoading && !hasNextPage && items.length > 0 && (
        <p className="text-center text-zinc-700 text-sm py-4">All {items.length} results loaded.</p>
      )}
    </div>
  )
}

