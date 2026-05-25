import { PlexClient, type PlexItem, type ProviderIds } from './plex-client.js'
import { JellyfinClient, type JellyfinItem } from './jellyfin-client.js'

export interface MatchResult {
  jellyfinItem: JellyfinItem | null
  method: 'provider_id' | 'title_year' | 'title_fuzzy' | 'none'
  confidence: number
}

export async function matchItem(
  plexItem: PlexItem,
  plexClient: PlexClient,
  jellyfinClient: JellyfinClient
): Promise<MatchResult> {
  const guids = plexItem.Guid || []
  const providerIds = PlexClient.extractProviderIds(guids)

  if (providerIds.tmdb || providerIds.tvdb || providerIds.imdb) {
    const match = await jellyfinClient.findByProviderIds(providerIds)
    if (match) {
      return { jellyfinItem: match, method: 'provider_id', confidence: 1.0 }
    }
  }

  const title = getItemTitle(plexItem)
  const year = getItemYear(plexItem)

  const searchResults = await jellyfinClient.search(title, 20)
  if (searchResults.length === 0) {
    return { jellyfinItem: null, method: 'none', confidence: 0 }
  }

  const exactTitleYear = searchResults.find((j) => {
    const nameMatch = j.Name.toLowerCase().trim() === title.toLowerCase().trim()
    const yearMatch = year ? j.ProductionYear === year : true
    return nameMatch && yearMatch
  })
  if (exactTitleYear) {
    return { jellyfinItem: exactTitleYear, method: 'title_year', confidence: 0.9 }
  }

  const fuzzyMatch = searchResults.find((j) => {
    const nameMatch = j.Name.toLowerCase().trim() === title.toLowerCase().trim()
    return nameMatch
  })
  if (fuzzyMatch) {
    return { jellyfinItem: fuzzyMatch, method: 'title_fuzzy', confidence: 0.7 }
  }

  const partialMatch = searchResults.find((j) => {
    return j.Name.toLowerCase().includes(title.toLowerCase()) ||
           title.toLowerCase().includes(j.Name.toLowerCase())
  })
  if (partialMatch) {
    return { jellyfinItem: partialMatch, method: 'title_fuzzy', confidence: 0.5 }
  }

  return { jellyfinItem: searchResults[0] || null, method: 'none', confidence: 0 }
}

function getItemTitle(item: PlexItem): string {
  if (item.type === 'episode') {
    return item.grandparentTitle || item.parentTitle || item.title
  }
  if (item.type === 'season') {
    return item.parentTitle || item.title
  }
  return item.title
}

function getItemYear(item: PlexItem): number | null {
  if (item.year) return item.year
  if (item.parentYear) return item.parentYear
  if (item.grandparentYear) return item.grandparentYear
  return null
}

export async function migrateWatchStatus(
  jellyfinClient: JellyfinClient,
  jellyfinItemId: string,
  plexItem: PlexItem
) {
  if (plexItem.viewCount && plexItem.viewCount > 0) {
    await jellyfinClient.markPlayed(jellyfinItemId)
  }

  if (plexItem.viewOffset && plexItem.viewOffset > 0) {
    const ticks = plexItem.viewOffset * 10_000
    await jellyfinClient.updatePlaybackPosition(jellyfinItemId, ticks)
  }
}

export async function migrateRating(
  jellyfinClient: JellyfinClient,
  jellyfinItemId: string,
  plexItem: PlexItem
) {
  if (plexItem.userRating) {
    await jellyfinClient.updateItemData(jellyfinItemId, {
      Id: jellyfinItemId,
      CommunityRating: plexItem.userRating,
    })
  }
}
