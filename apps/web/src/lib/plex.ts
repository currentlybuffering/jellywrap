export class PlexClient {
  private baseUrl: string
  private token: string

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = token
  }

  private headers(): Record<string, string> {
    return {
      'X-Plex-Token': this.token,
'X-Plex-Client-Identifier': 'jellywrap-migration',
'X-Plex-Product': 'JellyWrap',
      'X-Plex-Version': '0.1.0',
      'Accept': 'application/json',
    }
  }

  private async req(path: string, opts: RequestInit = {}): Promise<any> {
    const res = await fetch(`/api/plex/proxy${path}`, {
      ...opts,
      headers: { ...this.headers(), ...(opts.headers as Record<string, string> || {}) },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Plex ${res.status}: ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    return data.MediaContainer || data
  }

  async getLibraries() {
    const data = await this.req('/library/sections')
    return data.Directory || []
  }

  async getAllItems(sectionKey: string, start = 0, size = 100): Promise<{ items: any[]; total: number }> {
    const data = await this.req(`/library/sections/${sectionKey}/all?X-Plex-Container-Start=${start}&X-Plex-Container-Size=${size}&type=1,2,4&includeGuids=1`)
    return { items: data.Metadata || [], total: data.totalSize || 0 }
  }

  async getWatchHistory(itemKey: string) {
    const data = await this.req(`/status/sessions/history/all?metadataItemID=${itemKey}&maxResults=100`)
    return data.Metadata || []
  }

  async getPlaylists() {
    const data = await this.req('/playlists')
    return data.Metadata || []
  }

  async getPlaylistItems(playlistKey: string) {
    const data = await this.req(`/playlists/${playlistKey}/items`)
    return data.Metadata || []
  }

  async getAccount() {
    return this.req('/my/account')
  }

  static extractProviderIds(guids: any[]): Record<string, string> {
    const ids: Record<string, string> = {}
    if (!guids) return ids
    for (const g of guids) {
      if (!g?.id) continue
      const raw = g.id as string
      const match = raw.match(/com\.plexapp\.agents\.(\w+):\/\/(\d+)/)
      if (match) {
        const agent = match[1]
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
