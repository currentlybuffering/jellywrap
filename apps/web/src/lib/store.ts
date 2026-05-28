import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JellyfinClient } from './jellyfin'

interface VaultState {
  jellyfinUrl: string
  jellyfinToken: string
  jellyfinUserId: string
  plexUrl: string
  plexToken: string
  connected: boolean
  currentView: 'landing' | 'migrate' | 'media' | 'relay'
  playerName: string | null
  playingItem: any | null
  client: JellyfinClient | null

  setJellyfinAuth: (url: string, token: string, userId: string) => void
  setPlexAuth: (url: string, token: string) => void
  setConnected: (v: boolean) => void
  setCurrentView: (v: 'landing' | 'migrate' | 'media' | 'relay') => void
  setPlaying: (item: any | null, name?: string | null) => void
  initClient: (url: string) => JellyfinClient
  logout: () => void
}

export const useVault = create<VaultState>()(
  persist(
    (set, get) => ({
      jellyfinUrl: '',
      jellyfinToken: '',
      jellyfinUserId: '',
      plexUrl: '',
      plexToken: '',
      connected: false,
      currentView: 'landing',
      playerName: null,
      playingItem: null,
      client: null,

      setJellyfinAuth: (url, token, userId) => {
        const client = new JellyfinClient(url, token, userId)
        set({ jellyfinUrl: url, jellyfinToken: token, jellyfinUserId: userId, connected: true, client })
      },
      setPlexAuth: (url, token) => set({ plexUrl: url, plexToken: token }),
      setConnected: (v) => set({ connected: v }),
      setCurrentView: (v) => set({ currentView: v }),
      setPlaying: (item, name) => set({ playingItem: item, playerName: name || null }),
      initClient: (url) => {
        const { jellyfinToken, jellyfinUserId } = get()
        const client = new JellyfinClient(url, jellyfinToken, jellyfinUserId)
        set({ client, jellyfinUrl: url })
        return client
      },
    logout: () => set({
      jellyfinUrl: '',
      jellyfinToken: '',
      jellyfinUserId: '',
      plexUrl: '',
      plexToken: '',
      connected: false,
      client: null,
      playingItem: null,
      playerName: null,
    }),
    }),
    { name: 'jellywrap-store' }
  )
)
