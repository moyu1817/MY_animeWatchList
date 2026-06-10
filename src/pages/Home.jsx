import { useRef, useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { WatchlistButton } from '../components/WatchlistButton'
import { getUpcomingAnime, getCurrentSeason, getTopAnime } from '../services/anilistApi'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'

function AnimeRow({ title, queryKey, queryFn, linkTo }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey, queryFn })
  const items = dedupByMalId(data?.data ?? []).slice(0, 15)
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
            <button onClick={() => scroll(-1)} aria-label="Scroll left" className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer text-xs">‹</button>
            <button onClick={() => scroll(1)}  aria-label="Scroll right" className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer text-xs">›</button>
          </div>
          <Link to={linkTo} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">See all →</Link>
        </div>
      </div>

      <div className="relative">
        <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {isLoading || (isFetching && items.length === 0)
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
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  )
}

export function Home() {
  const { data: upcomingData } = useQuery({
    queryKey: ['upcoming', 1],
    queryFn: () => getUpcomingAnime(1),
  })

  const featuredList = useMemo(() => (upcomingData?.data ?? []).slice(0, 5), [upcomingData])
  const [heroIdx, setHeroIdx] = useState(0)
  const pausedRef = useRef(false)
  const listLenRef = useRef(0)
  listLenRef.current = featuredList.length
  const { recentlyViewed } = useRecentlyViewed()
  const recentRef = useRef(null)
  usePageTitle('Home')

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current && listLenRef.current > 1)
        setHeroIdx(i => (i + 1) % listLenRef.current)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="py-8 page-fade">
      {/* Hero carousel */}
      <div className="px-4 max-w-7xl mx-auto mb-10">
        <div
          className="relative rounded-xl overflow-hidden min-h-64 md:min-h-80 bg-zinc-950 border border-zinc-900"
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
        >
          {featuredList.length > 0 ? featuredList.map((item, i) => {
            const itemTitle = item.title_english ?? item.title
            const isActive = i === heroIdx
            return (
              <div
                key={item.mal_id}
                className={`absolute inset-0 flex items-end transition-opacity duration-700 ${isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={!isActive}
              >
                <img
                  src={item.images?.jpg?.large_image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                  referrerPolicy="no-referrer"
                  data-pin-nopin="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="relative p-6 md:p-10 max-w-2xl">
                  <p className="text-emerald-400 text-xs mb-2 font-semibold tracking-widest uppercase">Upcoming Anime</p>
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{itemTitle}</h1>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.score && <span className="bg-black/50 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs">★ {item.score}</span>}
                    {item.type && <span className="bg-black/50 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded text-xs">{item.type}</span>}
                    {item.episodes && <span className="bg-black/50 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded text-xs">{item.episodes} eps</span>}
                    {item.aired?.from && (
                      <span className="bg-black/50 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded text-xs">
                        {new Date(item.aired.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {item.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.genres.slice(0, 3).map(g => (
                        <span key={g.mal_id} className="text-xs text-zinc-400 bg-zinc-900/70 border border-zinc-700/50 px-2 py-0.5 rounded">{g.name}</span>
                      ))}
                    </div>
                  )}

                  {item.synopsis && (
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4 leading-relaxed">{item.synopsis}</p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/anime/${item.mal_id}`}
                      className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-md text-sm font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                    <WatchlistButton
                      anime={{
                        mal_id: item.mal_id,
                        title: itemTitle,
                        image_url: item.images?.jpg?.large_image_url,
                        score: item.score ?? null,
                        episodes: item.episodes ?? null,
                      }}
                      className="px-5"
                    />
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="absolute inset-0 flex items-end p-6 md:p-10">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-56 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          )}

          {/* Dot navigation */}
          {featuredList.length > 1 && (
            <div className="absolute bottom-4 right-5 flex gap-1.5 z-20">
              {featuredList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === heroIdx
                      ? 'w-5 h-1.5 bg-emerald-400'
                      : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 max-w-7xl mx-auto">
        {recentlyViewed.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Continue Browsing</h2>
              <div className="flex gap-1">
                <button onClick={() => recentRef.current?.scrollBy({ left: -700, behavior: 'smooth' })} aria-label="Scroll left" className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer text-xs">‹</button>
                <button onClick={() => recentRef.current?.scrollBy({ left: 700, behavior: 'smooth' })}  aria-label="Scroll right" className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer text-xs">›</button>
              </div>
            </div>
            <div ref={recentRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
              {recentlyViewed.slice(0, 10).map(anime => (
                <div key={anime.mal_id} className="w-40 shrink-0">
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          </section>
        )}

        <AnimeRow title="Upcoming This Season"  queryKey={['upcoming', 1]}                queryFn={() => getUpcomingAnime(1)}                linkTo="/upcoming" />
        <AnimeRow title="Currently Airing"       queryKey={['current', 1]}                queryFn={() => getCurrentSeason(1)}                linkTo="/seasons" />
        <AnimeRow title="Top Rated All Time"     queryKey={['top', '', '', 1]}             queryFn={() => getTopAnime(1, '', '')}             linkTo="/featured" />
        <AnimeRow title="Most Popular"           queryKey={['top', 'bypopularity', '', 1]} queryFn={() => getTopAnime(1, '', 'bypopularity')} linkTo="/featured?tab=bypopularity" />
      </div>
    </div>
  )
}
