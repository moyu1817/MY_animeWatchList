import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimeCard } from '../components/AnimeCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { getSchedule } from '../services/anilistApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { dedupByMalId } from '../utils/anime'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function getTodayKey() {
  const d = new Date().getDay() // 0=Sun
  const map = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' }
  return map[d]
}

export function Schedule() {
  usePageTitle('Airing Schedule')
  const today = getTodayKey()
  const [activeDay, setActiveDay] = useState(today)

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', activeDay],
    queryFn: () => getSchedule(activeDay),
    staleTime: 1000 * 60 * 30,
  })

  const items = dedupByMalId(data?.data ?? [])

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto page-fade">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Airing Schedule</h1>
        <span className="text-emerald-400 text-sm font-medium capitalize">Today: {today}</span>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-md p-1 w-fit flex-wrap">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`relative px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${
              activeDay === day ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
            {day === today && activeDay !== day && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      {!isLoading && items.length > 0 && (
        <p className="text-zinc-600 text-sm mb-5">
          {items.length} anime airing on <span className="capitalize text-zinc-400">{activeDay}</span>
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(anime => <AnimeCard key={anime.mal_id} anime={anime} showAiringBadge={false} />)
        }
      </div>

      {!isLoading && items.length === 0 && (
        <p className="text-center text-zinc-600 py-16">No anime scheduled for this day.</p>
      )}
    </div>
  )
}

