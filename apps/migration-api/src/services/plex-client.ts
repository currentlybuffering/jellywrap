import fetch from 'node-fetch'

export class PlexClient {
  private baseUrl: string
  private token: string

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = token
  }

  private headers() {
    return {
      'X-Plex-Token': this.token,
'X-Plex-Client-Identifier': 'jellywrap-migration',
'X-Plex-Product': 'JellyWrap',
      'X-Plex-Version': '0.1.0',
      'Accept': 'application/json',
    }
  }

  private async req(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers() })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Plex ${res.status}: ${text.slice(0, 200)}`)
    }
    const data = await res.json() as any
    return data.MediaContainer || data
  }

  async validate(): Promise<boolean> {
    try {
      await this.req('/my/account')
      return true
    } catch {
      return false
    }
  }

  async getLibraries() {
    const data = await this.req('/library/sections')
    return (data.Directory || []) as PlexLibrary[]
  }

  async getAllItems(sectionKey: string, start = 0, size = 100): Promise<{ items: PlexItem[]; total: number }> {
    const data = await this.req(
      `/library/sections/${sectionKey}/all?X-Plex-Container-Start=${start}&X-Plex-Container-Size=${size}&type=1,2,4&includeGuids=1`
    )
    return { items: data.Metadata || [], total: data.totalSize || 0 }
  }

  async getAllItemsPaginated(sectionKey: string): Promise<PlexItem[]> {
    const all: PlexItem[] = []
    let start = 0
    const batchSize = 100
    const first = await this.getAllItems(sectionKey, 0, batchSize)
    all.push(...first.items)
    const total = first.total
    for (start = batchSize; start < total; start += batchSize) {
      const batch = await this.getAllItems(sectionKey, start, batchSize)
      all.push(...batch.items)
      if (batch.items.length === 0) break
    }
    return all
  }

  async getWatchHistory(itemKey: string): Promise<PlexHistoryEntry[]> {
    const data = await this.req(`/status/sessions/history/all?metadataItemID=${itemKey}&maxResults=100`)
    return data.Metadata || []
  }

  async getPlaylists(): Promise<PlexItem[]> {
    const data = await this.req('/playlists')
    return data.Metadata || []
  }

  async getPlaylistItems(playlistKey: string): Promise<PlexItem[]> {
    const data = await this.req(`/playlists/${playlistKey}/items`)
    return data.Metadata || []
  }

  static extractProviderIds(guids: any[]): ProviderIds {
    const ids: ProviderIds = {}
    if (!guids) return ids
    for (const g of guids) {
      if (!g?.id) continue
      const raw = g.id as string
      const match = raw.match(/com\.plexapp\.agents\.(\w+):\/\/(.+?)(?:\?|$)/)
      if (match) {
        const agent = match[1].toLowerCase()
        const id = match[2]
        if (agent === 'themoviedb') ids.tmdb = id
        else if (agent === 'thetvdb') ids.tvdb = id
        else if (agent === 'imdb') ids.imdb = id.replace(/^tt/, '')
      }
      if (raw.startsWith('tmdb://')) ids.tmdb = raw.split('//')[1]?.split('?')[0]
      else if (raw.startsWith('tvdb://')) ids.tvdb = raw.split('//')[1]?.split('?')[0]
      else if (raw.startsWith('imdb://')) ids.imdb = raw.split('//')[1]?.split('?')[0]
    }
    return ids
  }
}

export interface PlexLibrary {
  key: string
  title: string
  type: string
}

export interface PlexItem {
  ratingKey: string
  key: string
  title: string
  type: string
  year?: number
  parentYear?: number
  grandparentYear?: number
  viewCount?: number
  viewOffset?: number
  userRating?: number
  audienceRating?: number
  Guid?: { id: string }[]
  parentTitle?: string
  grandparentTitle?: string
  index?: number
  parentIndex?: number
  leafCount?: number
  viewedLeafCount?: number
}

export interface PlexHistoryEntry {
  ratingKey: string
  viewOffset?: number
  viewedAt?: number
}

export interface ProviderIds {
  tmdb?: string
  tvdb?: string
  imdb?: string
}
