import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'recently_viewed'
const MAX = 10

const RecentlyViewedContext = createContext(null)

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] }
    catch { return [] }
  })

  const addToRecent = useCallback((anime) => {
    setRecentlyViewed(prev => {
      const entry = {
        mal_id: anime.mal_id,
        title: anime.title_english ?? anime.title,
        images: anime.images,
        score: anime.score ?? null,
        episodes: anime.episodes ?? null,
        airing: anime.airing ?? false,
        type: anime.type ?? null,
      }
      const filtered = prev.filter(a => a.mal_id !== anime.mal_id)
      const updated = [entry, ...filtered].slice(0, MAX)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecent }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext)
}
