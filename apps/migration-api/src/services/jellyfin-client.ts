import fetch from 'node-fetch'

export class JellyfinClient {
  private baseUrl: string
  private token: string
  private userId: string

  constructor(baseUrl: string, token: string, userId: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = token
    this.userId = userId
  }

  private headers() {
    return {
      'X-Emby-Token': this.token,
      'Content-Type': 'application/json',
    }
  }

  private async req(path: string, opts: { method?: string; body?: any } = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: opts.method || 'GET',
      headers: this.headers(),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Jellyfin ${res.status}: ${text.slice(0, 200)}`)
    }
    const text = await res.text()
    if (!text) return {}
    return JSON.parse(text)
  }

  static async authenticate(baseUrl: string, username: string, password: string) {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization':
          `MediaBrowser Client="JellyWrap", Device="Migration", DeviceId="jellywrap-migration", Version="0.1.0"`,
      },
      body: JSON.stringify({ Username: username, Pw: password }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Jellyfin auth failed (${res.status}): ${text.slice(0, 200)}`)
    }
    const data = await res.json() as any
    return {
      token: data.AccessToken as string,
      userId: (data.User?.Id || data.SessionInfo?.UserId) as string,
    }
  }

  async validate(): Promise<boolean> {
    try {
      await this.req('/System/Info')
      return true
    } catch {
      return false
    }
  }

  async search(query: string, limit = 10): Promise<JellyfinItem[]> {
    const data = await this.req(
      `/Items?searchTerm=${encodeURIComponent(query)}&Limit=${limit}&userId=${this.userId}&Recursive=true&Fields=ProviderIds,ProductionYear,Overview`
    )
    return data.Items || []
  }

  async findByProviderIds(providerIds: { tmdb?: string; tvdb?: string; imdb?: string }): Promise<JellyfinItem | null> {
    const checkMatch = (item: JellyfinItem): boolean => {
      const ids = item.ProviderIds || {}
      if (providerIds.tmdb && ids.Tmdb === providerIds.tmdb) return true
      if (providerIds.tvdb && ids.Tvdb === providerIds.tvdb) return true
      if (providerIds.imdb && (ids.Imdb === providerIds.imdb || ids.Imdb === `tt${providerIds.imdb}`)) return true
      return false
    }

    // Fast path: search recent/likely items with provider IDs
    const hasTmdb = providerIds.tmdb ? 'true' : ''
    const hasImdb = providerIds.imdb ? 'true' : ''
    const data = await this.req(
      `/Items?Recursive=true&userId=${this.userId}&Fields=ProviderIds,ProductionYear&HasTmdbId=${hasTmdb}&HasImdbId=${hasImdb}&Limit=500`
    )
    const items: JellyfinItem[] = data.Items || []
    for (const item of items) {
      if (checkMatch(item)) return item
    }
    return null
  }

  async markPlayed(itemId: string): Promise<void> {
    await this.req(`/Users/${this.userId}/PlayedItems/${itemId}`, { method: 'POST' })
  }

  async markUnplayed(itemId: string): Promise<void> {
    await this.req(`/Users/${this.userId}/PlayedItems/${itemId}`, { method: 'DELETE' })
  }

  async setFavorite(itemId: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? 'POST' : 'DELETE'
    await this.req(`/Users/${this.userId}/FavoriteItems/${itemId}`, { method })
  }

  async updatePlaybackPosition(itemId: string, positionTicks: number): Promise<void> {
    await this.req(`/Sessions/Playing/Progress`, {
      method: 'POST',
      body: {
        ItemId: itemId,
        PositionTicks: positionTicks,
        IsPaused: true,
        IsMuted: false,
        PlayMethod: 'DirectStream',
        CanSeek: true,
      },
    })
  }

  async updateItemData(itemId: string, data: Record<string, any>): Promise<void> {
    await this.req(`/Items/${itemId}`, { method: 'POST', body: data })
  }

  async getAllItems(parentId?: string): Promise<JellyfinItem[]> {
    const all: JellyfinItem[] = []
    let startIndex = 0
    const batchSize = 200
    while (true) {
      const qs = [
        `Recursive=true`,
        `userId=${this.userId}`,
        `Fields=ProviderIds,ProductionYear,Overview,MediaSources,MediaStreams,Path`,
        `Limit=${batchSize}`,
        `StartIndex=${startIndex}`,
      ]
      if (parentId) qs.push(`ParentId=${parentId}`)
      const data = await this.req(`/Items?${qs.join('&')}`)
      const items: JellyfinItem[] = data.Items || []
      all.push(...items)
      if (items.length < batchSize || all.length >= (data.TotalRecordCount || 0)) break
      startIndex += batchSize
    }
    return all
  }

  async getLibraries() {
    const data = await this.req(`/Users/${this.userId}/Views`)
    return (data.Items || []) as { Id: string; Name: string; Type: string; CollectionType?: string }[]
  }

  async getItem(itemId: string): Promise<JellyfinItem & Record<string, any>> {
    return this.req(`/Users/${this.userId}/Items/${itemId}?Fields=ProviderIds,ProductionYear,Overview,MediaSources,MediaStreams,Path`)
  }

  async getSeasons(seriesId: string): Promise<JellyfinItem[]> {
    const data = await this.req(`/Shows/${seriesId}/Seasons?userId=${this.userId}&Fields=ProviderIds,ProductionYear`)
    return data.Items || []
  }

  async getEpisodes(seriesId: string, seasonId: string): Promise<JellyfinItem[]> {
    const data = await this.req(`/Shows/${seriesId}/Episodes?seasonId=${seasonId}&userId=${this.userId}&Fields=ProviderIds,ProductionYear,IndexNumber`)
    return data.Items || []
  }

  async getRemoteSearch(providerName: string, info: Record<string, string>) {
    return this.req(`/Items/RemoteSearch?ProviderName=${providerName}`, {
      method: 'POST',
      body: info,
    })
  }
}

export interface JellyfinItem {
  Id: string
  Name: string
  Type: string
  ProductionYear?: number
  ProviderIds?: Record<string, string>
  Overview?: string
  RunTimeTicks?: number
  CommunityRating?: number
  OfficialRating?: string
  Genres?: string[]
  Studios?: { Name: string }[]
}
