import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { getUpcomingAnime, getCurrentSeason, getTopAnime } from '../services/jikanApi'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'

function AnimeRow({ title, queryKey, queryFn, linkTo }) {
  const { data, isLoading } = useQuery({ queryKey, queryFn })
  const items = data?.data?.slice(0, 10) ?? []

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <Link to={linkTo} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
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

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden mb-10 h-64 md:h-80 flex items-end bg-zinc-950 border border-zinc-900">
        {featured && (
          <img src={featured.images?.jpg?.large_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
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

      {/* Continue Browsing */}
      {recentlyViewed.length > 0 && (
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">Continue Browsing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyViewed.slice(0, 10).map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
          </div>
        </section>
      )}

      <AnimeRow
        title="Upcoming This Season"
        queryKey={['upcoming', 1]}
        queryFn={() => getUpcomingAnime(1)}
        linkTo="/upcoming"
      />
      <AnimeRow
        title="Currently Airing"
        queryKey={['current', 1]}
        queryFn={() => getCurrentSeason(1)}
        linkTo="/upcoming"
      />
      <AnimeRow
        title="Top Airing Right Now"
        queryKey={['top', 'airing', '', 1]}
        queryFn={() => getTopAnime(1, '', 'airing')}
        linkTo="/featured"
      />
      <AnimeRow
        title="Top Rated All Time"
        queryKey={['top', '', '', 1]}
        queryFn={() => getTopAnime(1, '', '')}
        linkTo="/featured"
      />
      <AnimeRow
        title="Most Popular"
        queryKey={['top', 'bypopularity', '', 1]}
        queryFn={() => getTopAnime(1, '', 'bypopularity')}
        linkTo="/featured"
      />
      <AnimeRow
        title="Top Movies"
        queryKey={['top', '', 'movie', 1]}
        queryFn={() => getTopAnime(1, 'movie', '')}
        linkTo="/featured"
      />
      <AnimeRow
        title="Most Favorited"
        queryKey={['top', 'favorite', '', 1]}
        queryFn={() => getTopAnime(1, '', 'favorite')}
        linkTo="/featured"
      />
    </div>
  )
}
