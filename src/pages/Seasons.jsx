import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { getSeasonsList, getSeasonAnime } from '../services/jikanApi'

const SEASON_COLORS = {
  winter: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  spring: 'text-green-400 bg-green-500/10 border-green-500/20',
  summer: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  fall: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

const SEASON_ICONS = { winter: '❄️', spring: '🌸', summer: '☀️', fall: '🍂' }

function getCurrentSeason() {
  const m = new Date().getMonth()
  if (m < 3) return 'winter'
  if (m < 6) return 'spring'
  if (m < 9) return 'summer'
  return 'fall'
}

export function Seasons() {
  const currentYear = new Date().getFullYear()
  const currentSeason = getCurrentSeason()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedSeason, setSelectedSeason] = useState(currentSeason)
  const [page, setPage] = useState(1)

  const { data: seasonsList, isLoading: loadingList } = useQuery({
    queryKey: ['seasons-list'],
    queryFn: getSeasonsList,
    staleTime: Infinity,
  })

  const { data: animeData, isLoading: loadingAnime } = useQuery({
    queryKey: ['season-anime', selectedYear, selectedSeason, page],
    queryFn: () => getSeasonAnime(selectedYear, selectedSeason, page),
    enabled: !!selectedYear && !!selectedSeason,
  })

  const items = animeData?.data ?? []
  const lastPage = animeData?.pagination?.last_visible_page ?? 1

  const availableYears = seasonsList
    ? [...new Set(seasonsList.map(s => s.year))].sort((a, b) => b - a)
    : []
  const availableSeasons = seasonsList?.find(s => s.year === selectedYear)?.seasons ?? []

  function selectYear(year) {
    setSelectedYear(year)
    setPage(1)
    const seasons = seasonsList?.find(s => s.year === year)?.seasons ?? []
    if (seasons.length && !seasons.includes(selectedSeason)) {
      setSelectedSeason(seasons[seasons.length - 1])
    }
  }

  function selectSeason(season) {
    setSelectedSeason(season)
    setPage(1)
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Season Archive</h1>

      <div className="flex flex-wrap items-end gap-6 mb-8">
        {/* Year — dropdown */}
        <div>
          <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Year</p>
          {loadingList ? (
            <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedYear}
              onChange={e => selectYear(Number(e.target.value))}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {/* Season buttons */}
        <div>
          <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Season</p>
          <div className="flex gap-2 flex-wrap">
            {(['winter', 'spring', 'summer', 'fall']
              .filter(s => s !== currentSeason)
              .reduce((acc, s) => [...acc, s], [currentSeason])
            ).map(season => {
              const available = availableSeasons.includes(season)
              const isCurrent = season === currentSeason && selectedYear === currentYear
              const isSelected = selectedSeason === season

              return (
                <button
                  key={season}
                  onClick={() => available && selectSeason(season)}
                  disabled={!available}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer capitalize disabled:opacity-30 disabled:cursor-default ${
                    isSelected
                      ? SEASON_COLORS[season]
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {SEASON_ICONS[season]} {season.charAt(0).toUpperCase() + season.slice(1)}
                  {isCurrent && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                      Now
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Current selection label */}
      <div className="mb-6 flex items-center gap-2">
        <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-lg border ${SEASON_COLORS[selectedSeason]}`}>
          {SEASON_ICONS[selectedSeason]} {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} {selectedYear}
        </span>
        {!loadingAnime && items.length > 0 && (
          <span className="text-gray-500 text-sm">
            {animeData?.pagination?.items?.total?.toLocaleString()} titles
          </span>
        )}
      </div>

      {/* Anime grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {loadingAnime
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)
        }
      </div>

      {!loadingAnime && items.length === 0 && (
        <p className="text-center text-gray-500 py-12">No anime found for this season.</p>
      )}

      {/* Pagination */}
      {!loadingAnime && items.length > 0 && (
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
