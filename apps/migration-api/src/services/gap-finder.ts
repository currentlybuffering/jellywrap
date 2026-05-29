import { JellyfinClient, type JellyfinItem } from './jellyfin-client.js'
import fetch from 'node-fetch'

export interface GapResult {
  seriesId: string
  seriesName: string
  seriesYear: number | undefined
  providerId: string | null
  missingSeasons: number[]
  missingEpisodes: { season: number; episode: number; title: string }[]
  totalMissing: number
}

export async function findGaps(
  client: JellyfinClient,
  libraryId?: string
): Promise<GapResult[]> {
  const items = await client.getAllItems(libraryId)
  const series = items.filter(i => i.Type === 'Series')
  const gaps: GapResult[] = []

  for (const show of series) {
    try {
      const seasons = await client.getSeasons(show.Id)
      const ownedSeasonNums = new Set<number>()
      const ownedEpisodes = new Map<number, Set<number>>()

      for (const season of seasons) {
        const sNum = (season as any).IndexNumber
        if (sNum == null) continue
        ownedSeasonNums.add(sNum)
        ownedEpisodes.set(sNum, new Set())

        const episodes = await client.getEpisodes(show.Id, season.Id)
        for (const ep of episodes) {
          const eNum = (ep as any).IndexNumber
          if (eNum != null) ownedEpisodes.get(sNum)!.add(eNum)
        }
      }

      const ids = show.ProviderIds || {}
      const tmdbId = ids.Tmdb
      const tvdbId = ids.Tvdb

      let expectedSeasons: { season_number: number; episode_count: number }[] | null = null
      if (tmdbId) {
        try {
          expectedSeasons = await getTmdbSeasonInfo(tmdbId)
        } catch { /* TMDB API can fail */ }
      }

      if (!expectedSeasons) continue

      const missingSeasons: number[] = []
      const missingEpisodes: { season: number; episode: number; title: string }[] = []

      for (const expected of expectedSeasons) {
        if (expected.season_number === 0) continue
        if (!ownedSeasonNums.has(expected.season_number)) {
          missingSeasons.push(expected.season_number)
          continue
        }
        const owned = ownedEpisodes.get(expected.season_number) || new Set()
        for (let e = 1; e <= expected.episode_count; e++) {
          if (!owned.has(e)) {
            missingEpisodes.push({
              season: expected.season_number,
              episode: e,
              title: `S${String(expected.season_number).padStart(2, '0')}E${String(e).padStart(2, '0')}`,
            })
          }
        }
      }

      const totalMissing = missingSeasons.length + missingEpisodes.length
      if (totalMissing > 0) {
        gaps.push({
          seriesId: show.Id,
          seriesName: show.Name,
          seriesYear: show.ProductionYear,
          providerId: tmdbId ? `tmdb:${tmdbId}` : tvdbId ? `tvdb:${tvdbId}` : null,
          missingSeasons,
          missingEpisodes,
          totalMissing,
        })
      }
    } catch {
      // Skip shows that error out
    }
  }

  return gaps.sort((a, b) => b.totalMissing - a.totalMissing)
}

async function getTmdbSeasonInfo(tmdbId: string): Promise<{ season_number: number; episode_count: number }[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}`, {
    headers: { 'Accept': 'application/json' },
  })
  if (res.ok) {
    const data = await res.json() as any
    return (data.seasons || []).map((s: any) => ({
      season_number: s.season_number,
      episode_count: s.episode_count,
    }))
  }

  return []
}
