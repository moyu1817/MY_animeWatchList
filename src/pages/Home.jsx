import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { getUpcomingAnime, getCurrentSeason } from '../services/jikanApi'

function AnimeRow({ title, queryKey, queryFn, linkTo }) {
  const { data, isLoading } = useQuery({ queryKey, queryFn })
  const items = data?.data?.slice(0, 10) ?? []

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <Link to={linkTo} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
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

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-10 h-64 md:h-80 flex items-end bg-gray-900 border border-gray-800">
        {featured && (
          <img
            src={featured.images?.jpg?.large_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="relative p-6 md:p-10">
          <p className="text-purple-400 text-sm mb-1 font-medium tracking-wide uppercase">Upcoming Anime</p>
          {featured ? (
            <>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                {featured.title_english ?? featured.title}
              </h1>
              <Link
                to={`/anime/${featured.mal_id}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Details
              </Link>
            </>
          ) : (
            <div className="h-8 w-64 bg-gray-800 rounded animate-pulse" />
          )}
        </div>
      </div>

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
    </div>
  )
}
