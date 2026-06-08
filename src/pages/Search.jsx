import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { searchAllAnime, getGenres } from '../services/jikanApi'

const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']
const STATUSES = [
  { label: 'All', value: '' },
  { label: 'Airing', value: 'airing' },
  { label: 'Complete', value: 'complete' },
  { label: 'Upcoming', value: 'upcoming' },
]

export function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  const [type, setType] = useState('All')
  const [status, setStatus] = useState('')
  const [genre, setGenre] = useState(null)
  const [page, setPage] = useState(1)
  const [showAllGenres, setShowAllGenres] = useState(false)

  useEffect(() => {
    setPage(1)
    setType('All')
    setStatus('')
    setGenre(null)
    setShowAllGenres(false)
  }, [urlQuery])

  const { data: genresData } = useQuery({
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

  const items = data?.data ?? []
  const total = data?.pagination?.items?.total ?? 0
  const lastPage = data?.pagination?.last_visible_page ?? 1

  function setFilter(setter) {
    return (value) => { setter(value); setPage(1) }
  }

  function toggleGenre(g) {
    setGenre(prev => prev?.mal_id === g.mal_id ? null : g)
    setPage(1)
  }

  // Empty state — no query and no genre selected
  if (!hasFilter) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Browse by Category</h1>
        <p className="text-gray-500 text-sm mb-5">Select a genre to browse, or type something in the search bar.</p>
        <div className="flex flex-wrap gap-2">
          {allGenres.map(g => (
            <button
              key={g.mal_id}
              onClick={() => toggleGenre(g)}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-purple-500 transition-colors cursor-pointer"
            >
              {g.name}
              <span className="ml-1.5 text-gray-600 text-xs">{g.count?.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {urlQuery
            ? <>Results for <span className="text-purple-400">"{urlQuery}"</span></>
            : <>Browsing <span className="text-purple-400">{genre?.name}</span></>
          }
        </h1>
        {!isLoading && total > 0 && (
          <p className="text-gray-500 text-sm mt-1">{total.toLocaleString()} anime found</p>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">

        {/* Genre chips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-sm">Category:</span>
            {genre && (
              <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                {genre.name} ×
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleGenres.map(g => (
              <button
                key={g.mal_id}
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors cursor-pointer ${
                  genre?.mal_id === g.mal_id
                    ? 'bg-purple-600 text-white border border-purple-500'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {g.name}
              </button>
            ))}
            {allGenres.length > 16 && (
              <button
                onClick={() => setShowAllGenres(v => !v)}
                className="px-3 py-1 rounded-lg text-sm text-blue-400 hover:text-blue-300 border border-gray-700 bg-gray-900 cursor-pointer transition-colors"
              >
                {showAllGenres ? 'Show less ↑' : `+${allGenres.length - 16} more ↓`}
              </button>
            )}
          </div>
        </div>

        {/* Type & Status */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-gray-500 text-sm shrink-0">Type:</span>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setFilter(setType)(t)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors cursor-pointer ${
                  type === t
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-gray-500 text-sm shrink-0">Status:</span>
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setFilter(setStatus)(s.value)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors cursor-pointer ${
                  status === s.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
        }
      </div>

      {!isLoading && items.length === 0 && (
        <p className="text-center text-gray-500 py-12">No results found. Try adjusting your filters.</p>
      )}

      {/* Pagination */}
      {!isLoading && items.length > 0 && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors cursor-pointer disabled:cursor-default"
          >
            ← Prev
          </button>
          <span className="text-gray-400 text-sm">Page {page} of {lastPage}</span>
          <button
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors cursor-pointer disabled:cursor-default"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
