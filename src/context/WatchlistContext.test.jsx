import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { WatchlistProvider } from './WatchlistContext'
import { useWatchlist } from '../hooks/useWatchlist'

const wrapper = ({ children }) => <WatchlistProvider>{children}</WatchlistProvider>

const ANIME_A = { mal_id: 1, title: 'Attack on Titan', image_url: '', score: 9.0, episodes: 25 }
const ANIME_B = { mal_id: 2, title: 'Demon Slayer', image_url: '', score: 8.5, episodes: 26 }

beforeEach(() => localStorage.clear())

describe('WatchlistContext', () => {
  it('starts with an empty watchlist', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    expect(result.current.watchlist).toHaveLength(0)
  })

  it('adds an anime with default status plan_to_watch', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    act(() => result.current.addAnime(ANIME_A))
    expect(result.current.watchlist).toHaveLength(1)
    expect(result.current.watchlist[0].status).toBe('plan_to_watch')
    expect(result.current.watchlist[0].mal_id).toBe(1)
  })

  it('does not add the same anime twice', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    act(() => { result.current.addAnime(ANIME_A); result.current.addAnime(ANIME_A) })
    expect(result.current.watchlist).toHaveLength(1)
  })

  it('removes an anime by mal_id', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    act(() => { result.current.addAnime(ANIME_A); result.current.addAnime(ANIME_B) })
    act(() => result.current.removeAnime(1))
    expect(result.current.watchlist).toHaveLength(1)
    expect(result.current.watchlist[0].mal_id).toBe(2)
  })

  it('updates the status of an anime', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    act(() => result.current.addAnime(ANIME_A))
    act(() => result.current.updateStatus(1, 'watching'))
    expect(result.current.watchlist[0].status).toBe('watching')
  })

  it('isInWatchlist returns correct boolean', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    act(() => result.current.addAnime(ANIME_A))
    expect(result.current.isInWatchlist(1)).toBe(true)
    expect(result.current.isInWatchlist(99)).toBe(false)
  })

  it('importWatchlist merges new entries without duplicating existing ones', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper })
    act(() => result.current.addAnime(ANIME_A))
    act(() => result.current.importWatchlist([
      { ...ANIME_A, title: 'Duplicate' },
      { ...ANIME_B },
    ]))
    expect(result.current.watchlist).toHaveLength(2)
    expect(result.current.watchlist[0].title).toBe('Attack on Titan')
  })
})
