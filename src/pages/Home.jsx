import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { getUpcomingAnime, getCurrentSeason, getTopAnime } from '../services/jikanApi'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { usePageTitle } from '../hooks/usePageTitle'

function AnimeRow({ title, queryKey, queryFn, linkTo }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey, queryFn })
  const items = data?.data?.slice(0, 15) ?? []
  const rowRef = useRef(null)

  function scroll(dir) {
    rowRef.current?.scrollBy({ left: dir * 700, behavior: 'smooth' })
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-3">
          {isError && (
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isFetching ? 'Retrying…' : 'Retry ↺'}
            </button>
          )}
          <div className="flex gap-1">
            <button onClick={() => scroll(-1)} className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer text-xs">‹</button>
            <button onClick={() => scroll(1)}  className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer text-xs">›</button>
          </div>
          <Link to={linkTo} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">See all →</Link>
        </div>
      </div>

      <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {isLoading || isFetching && items.length === 0
          ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-40 shrink-0"><SkeletonCard /></div>
          ))
          : isError && items.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-40 shrink-0 bg-zinc-900 border border-zinc-800 rounded-md aspect-[3/4] flex items-center justify-center">
              <span className="text-zinc-700 text-xs">—</span>
            </div>
          ))
          : items.map(anime => (
            <div key={anime.mal_id} className="w-40 shrink-0">
              <AnimeCard anime={anime} />
            </div>
          ))
        }
      </div>
    </section>
  )
}

export function Home() {
  const { data: upcomingData } = useQuery({
    queryKey: ['upcoming', 1],
    queryFn: () => getUpcomingAnime(1),
  })
  const featured = upcomingData?.data?.[0]
  const { recentlyViewed } = useRecentlyViewed()
  usePageTitle('Home')

  return (
    <div className="py-8 page-fade">
      {/* Hero */}
      <div className="px-4 max-w-7xl mx-auto mb-10">
        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 flex items-end bg-zinc-950 border border-zinc-900">
          {featured && (
            <img src={featured.images?.jpg?.large_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="relative p-6 md:p-10">
            <p className="text-emerald-400 text-xs mb-2 font-semibold tracking-widest uppercase">Upcoming Anime</p>
            {featured ? (
              <>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  {featured.title_english ?? featured.title}
                </h1>
                <Link
                  to={`/anime/${featured.mal_id}`}
                  className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  View Details
                </Link>
              </>
            ) : (
              <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Rows — full width with px padding handled inside */}
      <div className="px-4 max-w-7xl mx-auto">

        {recentlyViewed.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-semibold text-white mb-4">Continue Browsing</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
              {recentlyViewed.slice(0, 10).map(anime => (
                <div key={anime.mal_id} className="w-40 shrink-0">
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          </section>
        )}

        <AnimeRow title="Upcoming This Season"  queryKey={['upcoming', 1]}               queryFn={() => getUpcomingAnime(1)}           linkTo="/upcoming" />
        <AnimeRow title="Currently Airing"       queryKey={['current', 1]}                queryFn={() => getCurrentSeason(1)}           linkTo="/upcoming" />
        <AnimeRow title="Top Airing Right Now"   queryKey={['top', 'airing', '', 1]}      queryFn={() => getTopAnime(1, '', 'airing')}  linkTo="/featured" />
        <AnimeRow title="Top Rated All Time"     queryKey={['top', '', '', 1]}            queryFn={() => getTopAnime(1, '', '')}         linkTo="/featured" />
        <AnimeRow title="Most Popular"           queryKey={['top', 'bypopularity', '', 1]} queryFn={() => getTopAnime(1, '', 'bypopularity')} linkTo="/featured" />
        <AnimeRow title="Top Movies"             queryKey={['top', '', 'movie', 1]}       queryFn={() => getTopAnime(1, 'movie', '')}   linkTo="/featured" />
        <AnimeRow title="Most Favorited"         queryKey={['top', 'favorite', '', 1]}    queryFn={() => getTopAnime(1, '', 'favorite')} linkTo="/featured" />
      </div>
    </div>
  )
}
