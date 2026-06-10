const ENDPOINT = 'https://graphql.anilist.co'

async function query(q, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: q, variables }),
  })
  if (res.status === 429) {
    window.dispatchEvent(new CustomEvent('api:rate-limited'))
    const err = new Error('Rate limited')
    err.response = { status: 429 }
    throw err
  }
  if (!res.ok) {
    const err = new Error(`AniList error ${res.status}`)
    err.response = { status: res.status }
    throw err
  }
  const json = await res.json()
  if (json.errors?.length) {
    const err = new Error(json.errors[0].message)
    err.response = { status: json.errors[0].status ?? 500 }
    throw err
  }
  return json.data
}

// ─── Field maps ──────────────────────────────────────────────────────────────

const FORMAT_MAP = {
  TV: 'TV', TV_SHORT: 'TV', MOVIE: 'Movie', SPECIAL: 'Special',
  OVA: 'OVA', ONA: 'ONA', MUSIC: 'Music',
}
const STATUS_MAP = {
  RELEASING: 'Currently Airing',
  FINISHED: 'Finished Airing',
  NOT_YET_RELEASED: 'Not Yet Aired',
  CANCELLED: 'Cancelled',
  HIATUS: 'On Hiatus',
}

function toIso({ year, month, day } = {}) {
  if (!year) return null
  return `${year}-${String(month ?? 1).padStart(2, '0')}-${String(day ?? 1).padStart(2, '0')}`
}

function stripHtml(str) {
  return str ? str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim() : null
}

function normalizeMedia(m) {
  if (!m) return null
  return {
    mal_id:        m.id,
    title:         m.title?.romaji  ?? '',
    title_english: m.title?.english ?? null,
    images: {
      jpg: {
        image_url:       m.coverImage?.medium ?? '',
        large_image_url: m.coverImage?.large  ?? '',
      },
    },
    bannerImage: m.bannerImage ?? null,
    score:    m.meanScore ? +(m.meanScore / 10).toFixed(1) : null,
    episodes: m.episodes  ?? null,
    type:     FORMAT_MAP[m.format]  ?? m.format  ?? null,
    status:   STATUS_MAP[m.status]  ?? m.status  ?? null,
    airing:   m.status === 'RELEASING',
    synopsis: stripHtml(m.description) ?? null,
    genres:   (m.genres ?? []).map((name, i) => ({ mal_id: i + 1, name })),
    studios:  (m.studios?.nodes ?? []).map(s => ({ name: s.name })),
    aired:    { from: toIso(m.startDate) },
    duration: m.duration ? `${m.duration} min per ep` : null,
    trailer:  {
      embed_url: m.trailer?.site === 'youtube' && m.trailer?.id
        ? `https://www.youtube.com/embed/${m.trailer.id}`
        : null,
    },
  }
}

// ─── Shared fragments ─────────────────────────────────────────────────────────

const PAGE_INFO = `pageInfo { currentPage lastPage hasNextPage perPage total }`

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large medium }
  meanScore episodes format status genres
  description(asHtml:false)
  studios(isMain: true) { nodes { name } }
  startDate { year month day }
  nextAiringEpisode { airingAt episode }
`

// ─── Pagination helper ───────────────────────────────────────────────────────

function pageResult(pageData, mediaKey = 'media') {
  const items = (pageData[mediaKey] ?? []).map(normalizeMedia).filter(Boolean)
  const info = pageData.pageInfo ?? {}
  return {
    data: items,
    pagination: {
      current_page:      info.currentPage ?? 1,
      last_visible_page: info.lastPage    ?? 1,
      has_next_page:     info.hasNextPage ?? false,
      items: { total: info.total ?? items.length },
    },
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export async function getUpcomingAnime(page = 1) {
  const Q = `query($page:Int){Page(page:$page,perPage:25){${PAGE_INFO} media(type:ANIME,status:NOT_YET_RELEASED,sort:[POPULARITY_DESC]){${MEDIA_FIELDS}}}}`
  const d = await query(Q, { page })
  return pageResult(d.Page)
}

export async function getCurrentSeason(page = 1) {
  const Q = `query($page:Int){Page(page:$page,perPage:25){${PAGE_INFO} media(type:ANIME,status:RELEASING,sort:[POPULARITY_DESC]){${MEDIA_FIELDS}}}}`
  const d = await query(Q, { page })
  return pageResult(d.Page)
}

export async function getTopAnime(page = 1, format = '', filter = '') {
  const sortMap = {
    '':           'SCORE_DESC',
    airing:       'POPULARITY_DESC',
    bypopularity: 'POPULARITY_DESC',
    favorite:     'FAVOURITES_DESC',
    upcoming:     'POPULARITY_DESC',
  }
  const statusMap = { airing: 'RELEASING', upcoming: 'NOT_YET_RELEASED' }

  const sort   = sortMap[filter] ?? 'SCORE_DESC'
  const status = statusMap[filter] ?? null
  const fmt    = format ? format.toUpperCase() : null

  // Build query dynamically so null filters are omitted entirely (not passed as null)
  const vars        = { page, sort }
  const varDecls    = ['$page:Int', '$sort:MediaSort']
  const mediaArgs   = ['type:ANIME', 'sort:[$sort]', 'isAdult:false']

  if (fmt)    { varDecls.push('$format:MediaFormat'); mediaArgs.push('format:$format'); vars.format = fmt }
  if (status) { varDecls.push('$status:MediaStatus'); mediaArgs.push('status:$status'); vars.status = status }

  const Q = `query(${varDecls.join(',')}){Page(page:$page,perPage:25){${PAGE_INFO} media(${mediaArgs.join(',')}){${MEDIA_FIELDS}}}}`
  const d = await query(Q, vars)
  return pageResult(d.Page)
}

export async function getAnimeById(id) {
  const Q = `query($id:Int){Media(id:$id,type:ANIME){
    id title{romaji english native}
    coverImage{large medium extraLarge}
    bannerImage meanScore episodes format status
    description(asHtml:false)
    genres
    studios{nodes{name isAnimationStudio}}
    startDate{year month day}
    duration trailer{id site}
    season seasonYear
    source
    rankings{rank type context season year allTime}
    nextAiringEpisode{airingAt episode}
  }}`
  const d = await query(Q, { id: Number(id) })
  return normalizeMedia(d.Media)
}

export async function getAnimeCharacters(id) {
  const Q = `query($id:Int){Media(id:$id,type:ANIME){characters(sort:[ROLE,RELEVANCE],perPage:24){edges{role node{id name{full}image{medium}} voiceActors(language:JAPANESE){id name{full}image{large}}}}}}`
  const d = await query(Q, { id: Number(id) })
  return (d.Media?.characters?.edges ?? []).map(e => ({
    character: {
      mal_id:  e.node.id,
      name:    e.node.name.full,
      images:  { jpg: { image_url: e.node.image?.medium ?? '' } },
    },
    role: e.role === 'MAIN' ? 'Main' : e.role === 'SUPPORTING' ? 'Supporting' : e.role,
    voice_actors: (e.voiceActors ?? []).map(va => ({
      language: 'Japanese',
      person:   { name: va.name.full },
    })),
  }))
}

export async function getAnimeRecommendations(id) {
  const Q = `query($id:Int){Media(id:$id,type:ANIME){recommendations(sort:[RATING_DESC],perPage:20){nodes{rating mediaRecommendation{id title{romaji english}coverImage{large medium}format meanScore status}}}}}`
  const d = await query(Q, { id: Number(id) })
  return (d.Media?.recommendations?.nodes ?? [])
    .filter(n => n.mediaRecommendation)
    .map(n => ({
      entry:  normalizeMedia(n.mediaRecommendation),
      votes:  n.rating ?? 0,
    }))
}

export async function getAnimeRelated(id) {
  const Q = `query($id:Int){Media(id:$id,type:ANIME){relations{edges{relationType node{id title{romaji english}coverImage{large medium}format status}}}}}`
  const d = await query(Q, { id: Number(id) })
  return (d.Media?.relations?.edges ?? []).map(e => ({
    relationType: e.relationType,
    entry: normalizeMedia(e.node),
  }))
}

export async function searchAnime(q, page = 1) {
  const Q = `query($q:String,$page:Int){Page(page:$page,perPage:25){${PAGE_INFO} media(type:ANIME,search:$q,status:NOT_YET_RELEASED,sort:[POPULARITY_DESC]){${MEDIA_FIELDS}}}}`
  const d = await query(Q, { q, page })
  return pageResult(d.Page)
}

export async function searchAllAnime(q, page = 1, format = '', status = '', genres = []) {
  const statusMap = { airing: 'RELEASING', complete: 'FINISHED', upcoming: 'NOT_YET_RELEASED' }

  const fmt    = format ? format.toUpperCase() : null
  const stat   = statusMap[status] ?? null
  const search = q || null

  const vars      = { page }
  const varDecls  = ['$page:Int']
  const mediaArgs = ['type:ANIME', 'sort:[POPULARITY_DESC]', 'isAdult:false']

  if (search)          { varDecls.push('$q:String');           mediaArgs.push('search:$q');      vars.q      = search }
  if (fmt)             { varDecls.push('$format:MediaFormat'); mediaArgs.push('format:$format'); vars.format = fmt }
  if (stat)            { varDecls.push('$status:MediaStatus'); mediaArgs.push('status:$status'); vars.status = stat }
  if (genres?.length)  { varDecls.push('$genres:[String]');    mediaArgs.push('genre_in:$genres'); vars.genres = genres }

  const Q = `query(${varDecls.join(',')}){Page(page:$page,perPage:25){${PAGE_INFO} media(${mediaArgs.join(',')}){${MEDIA_FIELDS}}}}`
  const d = await query(Q, vars)
  return pageResult(d.Page)
}

export async function getGenres() {
  // AniList genres are a fixed list — no API call needed
  const genres = [
    'Action','Adventure','Comedy','Drama','Ecchi','Fantasy','Horror',
    'Mahou Shoujo','Mecha','Music','Mystery','Psychological','Romance',
    'Sci-Fi','Slice of Life','Sports','Supernatural','Thriller',
  ]
  return { data: genres.map((name, i) => ({ mal_id: i + 1, name })) }
}

export async function getSearchSuggestions(q) {
  const Q = `query($q:String){Page(perPage:6){media(type:ANIME,search:$q,sort:[POPULARITY_DESC],isAdult:false){id title{romaji english}coverImage{medium}format meanScore}}}`
  const d = await query(Q, { q })
  return (d.Page?.media ?? []).map(normalizeMedia)
}

export async function getSeasonsList() {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= 2000; y--) {
    years.push({ year: y, seasons: ['winter', 'spring', 'summer', 'fall'] })
  }
  return years
}

export async function getSeasonAnime(year, season, page = 1) {
  const seasonMap = { winter: 'WINTER', spring: 'SPRING', summer: 'SUMMER', fall: 'FALL' }
  const Q = `query($season:MediaSeason,$year:Int,$page:Int){Page(page:$page,perPage:25){${PAGE_INFO} media(type:ANIME,season:$season,seasonYear:$year,sort:[POPULARITY_DESC],isAdult:false){${MEDIA_FIELDS}}}}`
  const d = await query(Q, { season: seasonMap[season] ?? season.toUpperCase(), year: Number(year), page })
  return pageResult(d.Page)
}

export async function getRandomAnime() {
  const page = Math.floor(Math.random() * 50) + 1
  const Q = `query($page:Int){Page(page:$page,perPage:1){media(type:ANIME,sort:[POPULARITY_DESC],status_in:[RELEASING,FINISHED],isAdult:false){${MEDIA_FIELDS}}}}`
  const d = await query(Q, { page })
  return normalizeMedia(d.Page?.media?.[0])
}

export async function getSchedule(day) {
  const dayIndex = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 }
  const target = dayIndex[day] ?? 1

  // Query airing schedules for the next 7 days, then filter by day-of-week
  const now = Math.floor(Date.now() / 1000)
  const weekLater = now + 7 * 86400

  const Q = `query($from:Int,$to:Int){Page(perPage:100){airingSchedules(airingAt_greater:$from,airingAt_lesser:$to,sort:[TIME]){airingAt episode media{${MEDIA_FIELDS} isAdult}}}}`
  const d = await query(Q, { from: now, to: weekLater })

  const seen = new Set()
  const items = (d.Page?.airingSchedules ?? [])
    .filter(s => {
      const d = new Date(s.airingAt * 1000).getDay()
      return d === target
    })
    .filter(s => s.media && !s.media.isAdult)
    .reduce((acc, s) => {
      if (!seen.has(s.media.id)) { seen.add(s.media.id); acc.push(s.media) }
      return acc
    }, [])
    .map(normalizeMedia)

  return { data: items }
}
