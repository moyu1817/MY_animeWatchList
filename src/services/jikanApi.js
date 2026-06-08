import axios from 'axios'

const api = axios.create({ baseURL: 'https://api.jikan.moe/v4' })

export async function getUpcomingAnime(page = 1) {
  const { data } = await api.get('/seasons/upcoming', { params: { page } })
  return data
}

export async function getCurrentSeason(page = 1) {
  const { data } = await api.get('/seasons/now', { params: { page } })
  return data
}

export async function getAnimeById(id) {
  const { data } = await api.get(`/anime/${id}`)
  return data.data
}

export async function searchAnime(query, page = 1) {
  const { data } = await api.get('/anime', { params: { q: query, status: 'upcoming', page } })
  return data
}

export async function searchAllAnime(query, page = 1, type = '', status = '', genreId = null) {
  const params = { page, order_by: 'popularity', sort: 'desc' }
  if (query) params.q = query
  if (type) params.type = type
  if (status) params.status = status
  if (genreId) params.genres = genreId
  const { data } = await api.get('/anime', { params })
  return data
}

export async function getGenres() {
  const { data } = await api.get('/genres/anime')
  return data
}

export async function getTopAnime(page = 1, type = '', filter = '') {
  const params = { page }
  if (type) params.type = type
  if (filter) params.filter = filter
  const { data } = await api.get('/top/anime', { params })
  return data
}

export async function getSearchSuggestions(query) {
  const { data } = await api.get('/anime', { params: { q: query, limit: 6, order_by: 'members', sort: 'desc' } })
  return data.data
}

export async function getAnimeCharacters(id) {
  const { data } = await api.get(`/anime/${id}/characters`)
  return data.data
}

export async function getAnimeRecommendations(id) {
  const { data } = await api.get(`/anime/${id}/recommendations`)
  return data.data
}

export async function getSeasonsList() {
  const { data } = await api.get('/seasons')
  return data.data
}

export async function getSeasonAnime(year, season, page = 1) {
  const { data } = await api.get(`/seasons/${year}/${season}`, { params: { page } })
  return data
}

export async function getAnimeNews(id) {
  const { data } = await api.get(`/anime/${id}/news`)
  return data.data
}

export async function getRandomAnime() {
  const { data } = await api.get('/random/anime')
  return data.data
}

export async function getSchedule(day) {
  const { data } = await api.get(`/schedules/${day}`)
  return data
}
