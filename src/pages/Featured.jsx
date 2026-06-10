import { useState, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { getTopAnime } from '../services/jikanApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'

const TABS = [
  { label: 'Top Rated', filter: '' },
  { label: 'Most Popular', filter: 'bypopularity' },
  { label: 'Most Favorited', filter: 'favorite' },
  { label: 'Currently Airing', filter: 'airing' },
  { label: 'Upcoming', filter: 'upcoming' },
]

const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']

const btnBase = 'px-3 py-1 rounded-md text-sm transition-colors cursor-pointer'
const btnActive = 'bg-emerald-500 text-black font-semibold'
const btnInactive = 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'

export function Featured() {
  const [activeTab, setActiveTab] = useState(0)
  const [type, setType] = useState('All')

  usePageTitle('Featured')
  const filter = TABS[activeTab].filter
  const typeParam = type === 'All' ? '' : type.toLowerCase()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['top-infinite', filter, typeParam],
    queryFn: ({ pageParam }) => getTopAnime(pageParam, typeParam, filter),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_visible_page } = lastPage.pagination ?? {}
      return current_page < last_visible_page ? current_page + 1 : undefined
    },
  })

  const items = useMemo(() => dedupByMalId(data?.pages.flatMap(p => p.data ?? []) ?? []), [data])
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage)

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
      <h1 className="text-xl font-bold text-white mb-6">Featured Anime</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-zinc-900 border border-zinc-800 rounded-md p-1 w-fit flex-wrap">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
              activeTab === i ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)} className={`${btnBase} ${type === t ? btnActive : btnInactive}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((anime, i) => (
            <div key={`${anime.mal_id}-${i}`} className="relative flex flex-col">
              {i < 3 && (
                <span className={`absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full ${
                  i === 0 ? 'bg-yellow-400 text-black' :
                  i === 1 ? 'bg-zinc-300 text-black' :
                  'bg-amber-600 text-white'
                }`}>
                  #{i + 1}
                </span>
              )}
              <AnimeCard anime={anime} />
            </div>
          ))
        }
        {isFetchingNextPage && Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`next-${i}`} />)}
      </div>

      <div ref={sentinelRef} />
      {!isLoading && !hasNextPage && items.length > 0 && (
        <p className="text-center text-zinc-700 text-sm py-4">All {items.length} results loaded.</p>
      )}
    </div>
  )
}

