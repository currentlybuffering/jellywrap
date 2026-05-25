export class JellyfinClient {
  private baseUrl: string
  private token: string
  private userId: string
  private clientName = 'JellyWrap'
  private clientVersion = '0.1.0'
  private deviceId = 'jellywrap-web'

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = ''
    this.userId = ''
  }

  private headers(): Record<string, string> {
    return {
      'X-Emby-Token': this.token,
      'X-Emby-Authorization':
        `MediaBrowser Client="${this.clientName}", Device="Web", DeviceId="${this.deviceId}", Version="${this.clientVersion}", Token="${this.token}"`,
      'Content-Type': 'application/json',
    }
  }

  private async req(path: string, opts: RequestInit = {}): Promise<any> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...opts,
      headers: { ...this.headers(), ...(opts.headers as Record<string, string> || {}) },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Jellyfin ${res.status}: ${text.slice(0, 200)}`)
    }
    return res.json()
  }

  async authenticate(username: string, password: string) {
    const res = await fetch(`${this.baseUrl}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        ...this.headers(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Username: username, Pw: password }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Auth failed (${res.status}): ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    this.token = data.AccessToken
    this.userId = data.User?.Id || data.SessionInfo?.UserId || ''
    if (!this.userId) {
      const user = await this.getCurrentUser()
      this.userId = user.Id
    }
    return data
  }

  async getCurrentUser() {
    return this.req('/Users/Me')
  }

  async getViews() {
    const data = await this.req(`/Users/${this.userId}/Views`)
    return data.Items || []
  }

  async getItems(params: Record<string, any> = {}) {
    const qs = new URLSearchParams({
      userId: this.userId,
      Recursive: 'true',
      Fields: 'Overview,Genres,Studios,CommunityRating,OfficialRating,RunTimeTicks,ProductionYear,ProviderIds,DateCreated,MediaSources,MediaStreams',
      ...params,
    })
    const data = await this.req(`/Items?${qs}`)
    return { items: data.Items || [], total: data.TotalRecordCount || 0 }
  }

  async getContinueWatching() {
    const data = await this.req(`/Users/${this.userId}/Items/Resume?Limit=20&MediaTypes=Video&Fields=MediaSources,MediaStreams`)
    return data.Items || []
  }

  async getItem(itemId: string) {
    return this.req(`/Users/${this.userId}/Items/${itemId}`)
  }

  async search(query: string, limit = 20) {
    const data = await this.req(`/Items?searchTerm=${encodeURIComponent(query)}&Limit=${limit}&userId=${this.userId}&Recursive=true`)
    return data.Items || []
  }

  imageUrl(itemId: string, type = 'Primary', maxWidth = 400): string {
    return `${this.baseUrl}/Items/${itemId}/Images/${type}?maxWidth=${maxWidth}&tag=`
  }

  streamUrl(itemId: string, mediaSourceId?: string): string {
    let url = `${this.baseUrl}/Videos/${itemId}/stream?static=true&api_key=${this.token}`
    if (mediaSourceId) url += `&MediaSourceId=${mediaSourceId}`
    return url
  }

  audioStreamUrl(itemId: string, mediaSourceId?: string): string {
    let url = `${this.baseUrl}/Audio/${itemId}/stream?static=true&api_key=${this.token}`
    if (mediaSourceId) url += `&MediaSourceId=${mediaSourceId}`
    return url
  }

  async reportPlaybackStart(itemId: string, mediaSourceId?: string) {
    return this.req('/Sessions/Playing', {
      method: 'POST',
      body: JSON.stringify({
        ItemId: itemId,
        MediaSourceId: mediaSourceId,
        CanSeek: true,
        PlayMethod: 'DirectStream',
      }),
    })
  }

  async reportPlaybackProgress(itemId: string, positionTicks: number, mediaSourceId?: string) {
    return this.req('/Sessions/Playing/Progress', {
      method: 'POST',
      body: JSON.stringify({
        ItemId: itemId,
        MediaSourceId: mediaSourceId,
        PositionTicks: positionTicks,
        IsPaused: false,
        IsMuted: false,
        PlayMethod: 'DirectStream',
      }),
    })
  }

  async reportPlaybackStopped(itemId: string, positionTicks: number, mediaSourceId?: string) {
    return this.req('/Sessions/Playing/Stopped', {
      method: 'POST',
      body: JSON.stringify({
        ItemId: itemId,
        MediaSourceId: mediaSourceId,
        PositionTicks: positionTicks,
      }),
    })
  }

  async getSystemInfo() {
    return this.req('/System/Info')
  }

  async setFavorite(itemId: string, isFavorite: boolean) {
    const method = isFavorite ? 'POST' : 'DELETE'
    return this.req(`/Users/${this.userId}/FavoriteItems/${itemId}`, { method })
  }

  async setPlayed(itemId: string, isPlayed: boolean) {
    if (isPlayed) {
      return this.req(`/Users/${this.userId}/PlayedItems/${itemId}`, { method: 'POST' })
    } else {
      return this.req(`/Users/${this.userId}/PlayedItems/${itemId}`, { method: 'DELETE' })
    }
  }

  async updateItemRating(itemId: string, rating: number | null) {
    return this.req(`/Items/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ Id: itemId, CommunityRating: rating }),
    })
  }

  getAuthenticated() {
    return !!this.token && !!this.userId
  }

  getToken() { return this.token }
  getUserId() { return this.userId }
  getBaseUrl() { return this.baseUrl }
}
