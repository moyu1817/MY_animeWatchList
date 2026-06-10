import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { getSeasonsList, getSeasonAnime } from '../services/anilistApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'

const SEASON_COLORS = {
  winter: '#93c5fd',  // blue-300 — icy
  spring: '#f9a8d4',  // pink-300 — blossom
  summer: '#fcd34d',  // amber-300 — sunny
  fall:   '#fb923c',  // orange-400 — autumn
}

function SeasonIcon({ season }) {
  const props = {
    width: 14, height: 14, viewBox: '0 0 24 24',
    fill: 'none', stroke: SEASON_COLORS[season] ?? 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  }
  if (season === 'winter') return (
    <svg {...props}>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
    </svg>
  )
  if (season === 'spring') return (
    <svg {...props}>
      <ellipse cx="12" cy="7" rx="2" ry="3.5"/>
      <ellipse cx="12" cy="7" rx="2" ry="3.5" transform="rotate(90 12 12)"/>
      <ellipse cx="12" cy="7" rx="2" ry="3.5" transform="rotate(180 12 12)"/>
      <ellipse cx="12" cy="7" rx="2" ry="3.5" transform="rotate(270 12 12)"/>
      <circle cx="12" cy="12" r="2.5" fill={SEASON_COLORS.spring} stroke="none"/>
    </svg>
  )
  if (season === 'summer') return (
    <svg {...props}>
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="5.64" y1="5.64" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="18.36" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="16.24" y2="7.76"/>
      <line x1="7.76" y1="16.24" x2="5.64" y2="18.36"/>
    </svg>
  )
  if (season === 'fall') return (
    <svg {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
  return null
}

function getCurrentSeason() {
  const m = new Date().getMonth()
  if (m < 3) return 'winter'
  if (m < 6) return 'spring'
  if (m < 9) return 'summer'
  return 'fall'
}

const btnBase = 'px-4 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer capitalize disabled:opacity-30 disabled:cursor-default flex items-center gap-1.5'
const btnActive = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
const btnInactive = 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
const paginationBtn = 'px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer disabled:cursor-default'

export function Seasons() {
  const currentYear = new Date().getFullYear()
  const currentSeason = getCurrentSeason()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedSeason, setSelectedSeason] = useState(currentSeason)
  const [page, setPage] = useState(1)
  usePageTitle(`${selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} ${selectedYear} Season`)

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

  const items = dedupByMalId(animeData?.data ?? [])
  const lastPage = animeData?.pagination?.last_visible_page ?? 1
  const list = seasonsList ?? []
  const availableYears = list.length ? [...new Set(list.map(s => s.year))].sort((a, b) => b - a) : []
  const availableSeasons = list.find(s => s.year === selectedYear)?.seasons ?? ['winter', 'spring', 'summer', 'fall']

  function selectYear(year) {
    setSelectedYear(year)
    setPage(1)
    const seasons = list.find(s => s.year === year)?.seasons ?? ['winter', 'spring', 'summer', 'fall']
    if (seasons.length && !seasons.includes(selectedSeason)) setSelectedSeason(seasons[seasons.length - 1])
  }

  function selectSeason(season) { setSelectedSeason(season); setPage(1) }

  const orderedSeasons = [currentSeason, ...['winter', 'spring', 'summer', 'fall'].filter(s => s !== currentSeason)]

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
      <h1 className="text-xl font-bold text-white mb-6">Season Archive</h1>

      <div className="flex flex-wrap items-end gap-6 mb-8">
        {/* Year dropdown */}
        <div>
          <p className="text-zinc-600 text-xs mb-2 uppercase tracking-wide">Year</p>
          {loadingList ? (
            <div className="h-10 w-28 bg-zinc-900 rounded-md animate-pulse" />
          ) : (
            <select
              value={selectedYear}
              onChange={e => selectYear(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {/* Season buttons */}
        <div>
          <p className="text-zinc-600 text-xs mb-2 uppercase tracking-wide">Season</p>
          <div className="flex gap-2 flex-wrap">
            {orderedSeasons.map(season => {
              const available = availableSeasons.includes(season)
              const isCurrent = season === currentSeason && selectedYear === currentYear
              const isSelected = selectedSeason === season
              return (
                <button
                  key={season}
                  onClick={() => available && selectSeason(season)}
                  disabled={!available}
                  className={`relative ${btnBase} ${isSelected ? btnActive : btnInactive}`}
                >
                  <SeasonIcon season={season} />
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                  {isCurrent && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-xs px-1.5 py-0.5 rounded-full leading-none font-semibold">
                      Now
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-semibold px-3 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5">
          <SeasonIcon season={selectedSeason} />
          {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} {selectedYear}
        </span>
        {!loadingAnime && items.length > 0 && (
          <span className="text-zinc-600 text-sm">{items.length} shown</span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {loadingAnime
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} showAiringBadge={false} />)
        }
      </div>

      {!loadingAnime && items.length === 0 && (
        <p className="text-center text-zinc-600 py-12">No anime found for this season.</p>
      )}

      {!loadingAnime && items.length > 0 && (
        <div className="flex justify-center items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={paginationBtn}>← Prev</button>
          <span className="text-zinc-500 text-sm">Page {page} of {lastPage}</span>
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className={paginationBtn}>Next →</button>
        </div>
      )}
    </div>
  )
}
