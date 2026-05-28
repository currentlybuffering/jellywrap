export class JellyfinClient {
  private baseUrl: string
  private _token: string
  private _userId: string
  private clientName = 'JellyWrap'
  private clientVersion = '0.1.0'
  private deviceId: string

  constructor(baseUrl: string, token?: string, userId?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this._token = token || ''
    this._userId = userId || ''
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jw-device-id')
      if (stored) {
        this.deviceId = stored
      } else {
        this.deviceId = 'jw-' + crypto.randomUUID()
        localStorage.setItem('jw-device-id', this.deviceId)
      }
    } else {
      this.deviceId = 'jw-ssr'
    }
  }

  private headers(): Record<string, string> {
    return {
      'X-Emby-Token': this._token,
      'X-Emby-Authorization':
        `MediaBrowser Client="${this.clientName}", Device="Web", DeviceId="${this.deviceId}", Version="${this.clientVersion}", Token="${this._token}"`,
      'Content-Type': 'application/json',
    }
  }

  private async req(path: string, opts: RequestInit = {}): Promise<any> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...opts,
      headers: { ...this.headers(), ...(opts.headers as Record<string, string> || {}) },
    })
    if (!res.ok) {
      const userMessages: Record<number, string> = {
        401: 'Wrong username or password. Please check your credentials.',
        403: 'You don\'t have permission to do this. Try logging in as an admin.',
        404: 'The item you\'re looking for doesn\'t exist.',
        500: 'The server had a problem. Try again in a moment.',
        502: 'Can\'t reach the server. Check that it\'s running and the URL is correct.',
        503: 'The server is temporarily unavailable. Try again shortly.',
      }
      throw new Error(userMessages[res.status] || `Something went wrong (error ${res.status}). Please try again.`)
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
      const userMessages: Record<number, string> = {
        401: 'Wrong username or password. Please check your credentials.',
        403: 'You don\'t have permission to do this.',
        404: 'Server not found. Check the URL and try again.',
      }
      throw new Error(userMessages[res.status] || `Could not connect to server. Check the URL and try again.`)
    }
    const data = await res.json()
    this._token = data.AccessToken
    this._userId = data.User?.Id || data.SessionInfo?.UserId || ''
    if (!this._userId) {
      const user = await this.getCurrentUser()
      this._userId = user.Id
    }
    return data
  }

  async getCurrentUser() {
    return this.req('/Users/Me')
  }

  async getViews() {
    const data = await this.req(`/Users/${this._userId}/Views`)
    return data.Items || []
  }

  async getItems(params: Record<string, any> = {}) {
    const qs = new URLSearchParams({
      userId: this._userId,
      Recursive: 'true',
      Fields: 'Overview,Genres,Studios,CommunityRating,OfficialRating,RunTimeTicks,ProductionYear,ProviderIds,DateCreated,MediaSources,MediaStreams',
      ...params,
    })
    const data = await this.req(`/Items?${qs}`)
    return { items: data.Items || [], total: data.TotalRecordCount || 0 }
  }

  async getContinueWatching() {
    const data = await this.req(`/Users/${this._userId}/Items/Resume?Limit=20&MediaTypes=Video&Fields=MediaSources,MediaStreams`)
    return data.Items || []
  }

  async getItem(itemId: string) {
    return this.req(`/Users/${this._userId}/Items/${itemId}`)
  }

  async search(query: string, limit = 20) {
    const data = await this.req(`/Items?searchTerm=${encodeURIComponent(query)}&Limit=${limit}&userId=${this._userId}&Recursive=true`)
    return data.Items || []
  }

  imageUrl(itemId: string, type = 'Primary', maxWidth = 400): string {
    return `${this.baseUrl}/Items/${itemId}/Images/${type}?maxWidth=${maxWidth}&tag=`
  }

  streamUrl(itemId: string, mediaSourceId?: string): string {
    let url = `${this.baseUrl}/Videos/${itemId}/stream?static=true&api_key=${this._token}`
    if (mediaSourceId) url += `&MediaSourceId=${mediaSourceId}`
    return url
  }

  audioStreamUrl(itemId: string, mediaSourceId?: string): string {
    let url = `${this.baseUrl}/Audio/${itemId}/stream?static=true&api_key=${this._token}`
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
    return this.req(`/Users/${this._userId}/FavoriteItems/${itemId}`, { method })
  }

  async setPlayed(itemId: string, isPlayed: boolean) {
    if (isPlayed) {
      return this.req(`/Users/${this._userId}/PlayedItems/${itemId}`, { method: 'POST' })
    } else {
      return this.req(`/Users/${this._userId}/PlayedItems/${itemId}`, { method: 'DELETE' })
    }
  }

  async updateItemRating(itemId: string, rating: number | null) {
    return this.req(`/Items/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ Id: itemId, CommunityRating: rating }),
    })
  }

  getAuthenticated() {
    return !!this._token && !!this._userId
  }

  getToken() { return this._token }
  getUserId() { return this._userId }
  getBaseUrl() { return this.baseUrl }
}
