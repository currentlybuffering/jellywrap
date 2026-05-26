import { JellyfinClient, type JellyfinItem } from './jellyfin-client.js'
import fetch from 'node-fetch'

export interface SubtitleResult {
  fileName: string
  language: string
  languageCode: string
  downloadUrl: string
  source: string
  score: number
}

export async function findSubtitles(
  client: JellyfinClient,
  itemId: string
): Promise<SubtitleResult[]> {
  const item = await client.getItem(itemId)
  const ids = item.ProviderIds || {}
  const tmdbId = ids.Tmdb || ids.TmdbCollection
  const imdbId = ids.Imdb

  const results: SubtitleResult[] = []

  const title = item.Name
  const year = item.ProductionYear
  const isMovie = item.Type === 'Movie'
  const seasonNum = (item as any).ParentIndexNumber || (item as any).SeasonNumber
  const episodeNum = (item as any).IndexNumber

  const opensubtitles = await searchOpenSubtitles({
    tmdbId,
    imdbId,
    title,
    year,
    isMovie,
    season: seasonNum,
    episode: episodeNum,
  })
  results.push(...opensubtitles)

  return results.sort((a, b) => b.score - a.score).slice(0, 20)
}

async function searchOpenSubtitles(opts: {
  tmdbId?: string
  imdbId?: string
  title: string
  year?: number
  isMovie: boolean
  season?: number
  episode?: number
}): Promise<SubtitleResult[]> {
  const results: SubtitleResult[] = []

  try {
    const params = new URLSearchParams()
    if (opts.tmdbId) {
      params.set(opts.isMovie ? 'tmdb_id' : 'tmdb_id', opts.tmdbId)
    }
    if (opts.imdbId) {
      params.set('imdb_id', opts.imdbId.replace(/^tt/, ''))
    }
    params.set('query', opts.title)
    if (opts.year) params.set('year', String(opts.year))
    if (!opts.isMovie && opts.season) params.set('season_number', String(opts.season))
    if (!opts.isMovie && opts.episode) params.set('episode_number', String(opts.episode))

    const res = await fetch(`https://rest.opensubtitles.org/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'JellyWrap v0.1.0',
        'Accept': 'application/json',
      },
    })
    if (!res.ok) return results

    const data = await res.json() as any[]
    for (const sub of data.slice(0, 10)) {
      results.push({
        fileName: sub.SubFileName || sub.MovieReleaseName || 'unknown.srt',
        language: sub.SubLanguageName || 'Unknown',
        languageCode: sub.SubLanguageID || 'en',
        downloadUrl: sub.SubDownloadLink || sub.ZipDownloadLink || '',
        source: 'OpenSubtitles',
        score: parseFloat(sub.SubRating || '0') + (sub.SubDownloadsCnt ? Math.min(parseInt(sub.SubDownloadsCnt) / 1000, 2) : 0),
      })
    }
  } catch {
    // OpenSubtitles free API is flaky — fail gracefully
  }

  try {
    const params = new URLSearchParams()
    params.set('query', opts.title)
    if (opts.year) params.set('year', String(opts.year))
    const res = await fetch(`https://api.gestdown.dev/search?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return results
    const data = await res.json() as any
    const subs = data.subtitles || data.data || []
    for (const sub of subs.slice(0, 5)) {
      results.push({
        fileName: sub.fileName || sub.name || `${opts.title}.srt`,
        language: sub.language || 'English',
        languageCode: sub.languageCode || sub.language_code || 'en',
        downloadUrl: sub.url || sub.downloadUrl || '',
        source: 'Gestdown',
        score: 1,
      })
    }
  } catch {
    // Gestdown is also flaky
  }

  return results
}
