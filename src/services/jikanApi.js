import axios from 'axios'

const api = axios.create({ baseURL: 'https://api.jikan.moe/v4', timeout: 10000 })

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 429) window.dispatchEvent(new CustomEvent('api:rate-limited'))
    return Promise.reject(err)
  }
)

// Token-bucket queue: allows 3 requests/sec, queues the rest instead of 429ing
let tokens = 3
let lastRefill = Date.now()
const pending = []

function drainQueue() {
  const now = Date.now()
  const refill = Math.floor((now - lastRefill) * 3 / 1000)
  if (refill > 0) { tokens = Math.min(3, tokens + refill); lastRefill = now }
  while (pending.length > 0 && tokens > 0) {
    tokens--
    const { fn, resolve, reject } = pending.shift()
    fn().then(resolve).catch(reject)
  }
  if (pending.length > 0) setTimeout(drainQueue, Math.ceil(1000 / 3))
}

function queued(fn) {
  return new Promise((resolve, reject) => {
    pending.push({ fn, resolve, reject })
    drainQueue()
  })
}

const get = (url, params) => queued(() => api.get(url, params ? { params } : undefined).then(r => r.data))

export const getUpcomingAnime       = (page = 1)                          => get('/seasons/upcoming', { page })
export const getCurrentSeason       = (page = 1)                          => get('/seasons/now', { page })
export const getAnimeById           = (id)                                 => get(`/anime/${id}`).then(d => d.data)
export const searchAnime            = (query, page = 1)                    => get('/anime', { q: query, status: 'upcoming', page })
export const getGenres              = ()                                    => get('/genres/anime')
export const getAnimeCharacters     = (id)                                 => get(`/anime/${id}/characters`).then(d => d.data)
export const getAnimeRecommendations= (id)                                 => get(`/anime/${id}/recommendations`).then(d => d.data)
export const getSeasonsList         = ()                                    => get('/seasons').then(d => d.data)
export const getSeasonAnime         = (year, season, page = 1)             => get(`/seasons/${year}/${season}`, { page })
export const getAnimeNews           = (id)                                 => get(`/anime/${id}/news`).then(d => d.data)
export const getRandomAnime         = ()                                    => get('/random/anime').then(d => d.data)
export const getSchedule            = (day)                                => get(`/schedules/${day}`)
export const getSearchSuggestions   = (query)                              => get('/anime', { q: query, limit: 6, order_by: 'members', sort: 'desc' }).then(d => d.data)

export function searchAllAnime(query, page = 1, type = '', status = '', genreId = null) {
  const params = { page, order_by: 'popularity', sort: 'desc' }
  if (query)   params.q      = query
  if (type)    params.type   = type
  if (status)  params.status = status
  if (genreId) params.genres = genreId
  return get('/anime', params)
}

export function getTopAnime(page = 1, type = '', filter = '') {
  const params = { page }
  if (type)   params.type   = type
  if (filter) params.filter = filter
  return get('/top/anime', params)
}
