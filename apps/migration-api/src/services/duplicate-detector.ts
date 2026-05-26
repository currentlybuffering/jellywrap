import { JellyfinClient, type JellyfinItem } from './jellyfin-client.js'

export interface DuplicateGroup {
  key: string
  title: string
  year: number | undefined
  providerId: string | null
  items: JellyfinItem[]
  suggestedKeep: string
  suggestedRemove: string[]
}

export async function findDuplicates(client: JellyfinClient, libraryId?: string): Promise<DuplicateGroup[]> {
  const items = await client.getAllItems(libraryId)
  const byTitle = new Map<string, JellyfinItem[]>()
  const byTmdb = new Map<string, JellyfinItem[]>()
  const byImdb = new Map<string, JellyfinItem[]>()

  for (const item of items) {
    if (item.Type !== 'Movie' && item.Type !== 'Series') continue

    const titleKey = `${item.Name.toLowerCase().trim()}::${item.ProductionYear || ''}`
    if (!byTitle.has(titleKey)) byTitle.set(titleKey, [])
    byTitle.get(titleKey)!.push(item)

    const ids = item.ProviderIds || {}
    if (ids.Tmdb) {
      if (!byTmdb.has(ids.Tmdb)) byTmdb.set(ids.Tmdb, [])
      byTmdb.get(ids.Tmdb)!.push(item)
    }
    if (ids.Imdb) {
      if (!byImdb.has(ids.Imdb)) byImdb.set(ids.Imdb, [])
      byImdb.get(ids.Imdb)!.push(item)
    }
  }

  const seen = new Set<string>()
  const groups: DuplicateGroup[] = []

  const addGroup = (items: JellyfinItem[], key: string) => {
    if (items.length < 2) return
    const itemIds = items.map(i => i.Id).sort().join(',')
    if (seen.has(itemIds)) return
    seen.add(itemIds)

    const sorted = [...items].sort((a, b) => {
      const aSize = (a as any).MediaSources?.length || 0
      const bSize = (b as any).MediaSources?.length || 0
      if (aSize !== bSize) return bSize - aSize
      const aPath = (a as any).Path || ''
      const bPath = (b as any).Path || ''
      return aPath.localeCompare(bPath)
    })

    groups.push({
      key,
      title: sorted[0].Name,
      year: sorted[0].ProductionYear,
      providerId: sorted[0].ProviderIds?.Tmdb
        ? `tmdb:${sorted[0].ProviderIds.Tmdb}`
        : sorted[0].ProviderIds?.Imdb
          ? `imdb:${sorted[0].ProviderIds.Imdb}`
          : null,
      items: sorted,
      suggestedKeep: sorted[0].Id,
      suggestedRemove: sorted.slice(1).map(i => i.Id),
    })
  }

  for (const [tmdbId, items] of byTmdb) addGroup(items, `tmdb:${tmdbId}`)
  for (const [imdbId, items] of byImdb) addGroup(items, `imdb:${imdbId}`)
  for (const [titleKey, items] of byTitle) {
    const hasProviderDup = items.some(i => {
      const ids = i.ProviderIds || {}
      return (ids.Tmdb && byTmdb.get(ids.Tmdb)?.length > 1) || (ids.Imdb && byImdb.get(ids.Imdb)?.length > 1)
    })
    if (!hasProviderDup) addGroup(items, `title:${titleKey}`)
  }

  return groups.sort((a, b) => b.items.length - a.items.length)
}
