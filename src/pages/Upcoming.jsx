import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { useDebounce } from '../hooks/useDebounce'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { getUpcomingAnime, searchAnime } from '../services/jikanApi'

const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']

export function Upcoming() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const debouncedSearch = useDebounce(search, 400)

  const isSearching = debouncedSearch.trim().length > 0

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: isSearching ? ['upcoming-search', debouncedSearch] : ['upcoming-infinite'],
    queryFn: ({ pageParam }) => isSearching
      ? searchAnime(debouncedSearch, pageParam)
      : getUpcomingAnime(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_visible_page } = lastPage.pagination ?? {}
      return current_page < last_visible_page ? current_page + 1 : undefined
    },
  })

  const allItems = data?.pages.flatMap(p => p.data) ?? []
  const items = allItems.filter(a => type === 'All' || a.type === type)

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage)

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Upcoming Anime</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search upcoming anime..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors w-full sm:w-72"
        />
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                type === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — skeletons appended inside same grid to avoid layout gap */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((anime, i) => <AnimeCard key={`${anime.mal_id}-${i}`} anime={anime} />)
        }
        {isFetchingNextPage && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`next-${i}`} />)}
      </div>

      {!isLoading && items.length === 0 && (
        <p className="text-center text-gray-500 py-12">No anime found.</p>
      )}

      {/* Invisible sentinel — triggers next page load */}
      <div ref={sentinelRef} />

      {!isLoading && !hasNextPage && items.length > 0 && (
        <p className="text-center text-gray-600 text-sm py-4">All {items.length} results loaded.</p>
      )}
    </div>
  )
}
