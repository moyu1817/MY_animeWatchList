import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'anime_watchlist'

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  function addAnime(anime) {
    setWatchlist(prev => {
      if (prev.some(a => a.mal_id === anime.mal_id)) return prev
      return [...prev, { ...anime, status: 'plan_to_watch', rating: null, addedAt: new Date().toISOString() }]
    })
  }

  function removeAnime(mal_id) {
    setWatchlist(prev => prev.filter(a => a.mal_id !== mal_id))
  }

  function updateStatus(mal_id, status) {
    setWatchlist(prev => prev.map(a => a.mal_id === mal_id ? { ...a, status } : a))
  }

  function updateRating(mal_id, rating) {
    setWatchlist(prev => prev.map(a => a.mal_id === mal_id ? { ...a, rating } : a))
  }

  function isInWatchlist(mal_id) {
    return watchlist.some(a => a.mal_id === mal_id)
  }

  function importWatchlist(entries) {
    setWatchlist(prev => {
      const existingIds = new Set(prev.map(a => a.mal_id))
      const fresh = entries.filter(a => a?.mal_id != null && !existingIds.has(a.mal_id))
      return [...prev, ...fresh]
    })
  }

  return (
    <WatchlistContext.Provider value={{ watchlist, addAnime, removeAnime, updateStatus, updateRating, isInWatchlist, importWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider')
  return ctx
}
