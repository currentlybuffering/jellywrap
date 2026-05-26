export interface DuplicateGroup {
  key: string
  title: string
  year: number | undefined
  providerId: string | null
  items: { Id: string; Name: string; Type: string; ProductionYear?: number; ProviderIds?: Record<string, string> }[]
  suggestedKeep: string
  suggestedRemove: string[]
}

export interface SubtitleResult {
  fileName: string
  language: string
  languageCode: string
  downloadUrl: string
  source: string
  score: number
}

export interface GapResult {
  seriesId: string
  seriesName: string
  seriesYear: number | undefined
  providerId: string | null
  missingSeasons: number[]
  missingEpisodes: { season: number; episode: number; title: string }[]
  totalMissing: number
}
