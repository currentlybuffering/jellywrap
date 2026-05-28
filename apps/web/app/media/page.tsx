'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useVault } from '@/lib/store'
import { JellyfinClient } from '@/lib/jellyfin'
import JellyfinAuthForm from '@/components/jellyfin-auth-form'

type ViewMode = 'auth' | 'browse' | 'detail' | 'player'

export default function MediaPage() {
  const { connected, jellyfinUrl, jellyfinToken, jellyfinUserId, client: storedClient, initClient, setJellyfinAuth } = useVault()
  const [mode, setMode] = useState<ViewMode>(connected ? 'browse' : 'auth')
  const [client, setClient] = useState<JellyfinClient | null>(null)
  const [libraries, setLibraries] = useState<any[]>([])
  const [currentLib, setCurrentLib] = useState<string>('')
  const [items, setItems] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [continueWatching, setContinueWatching] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (connected && jellyfinUrl && jellyfinToken && jellyfinUserId) {
      const c = new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId)
      setClient(c)
      setMode('browse')
    c.getViews().then(views => {
      setLibraries(views)
      if (views.length > 0) {
        setCurrentLib(views[0].Id)
        loadLibrary(c, views[0].Id)
      }
    }).catch((err: any) => { setError(err.message || 'Could not load libraries') })
      loadContinueWatching(c)
    }
  }, [connected, jellyfinUrl, jellyfinToken, jellyfinUserId])

  const loadLibrary = useCallback(async (c: JellyfinClient, parentId?: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = { SortBy: 'SortName', SortOrder: 'Ascending' }
      if (parentId) params.ParentId = parentId
      const data = await c.getItems(params)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadContinueWatching = useCallback(async (c: JellyfinClient) => {
    try {
      const data = await c.getContinueWatching()
      setContinueWatching(data)
    } catch { /* non-critical */ }
  }, [])

  useEffect(() => {
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!client || query.length < 2) { setSearchResults([]); return }
    try {
      const results = await client.search(query)
      setSearchResults(results)
    } catch { /* ignore */ }
  }

  const handleSelectItem = async (itemId: string) => {
    if (!client) return
    try {
      const item = await client.getItem(itemId)
      setSelectedItem(item)
      setMode('detail')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handlePlay = async (itemId: string, mediaSourceId?: string) => {
    if (!client) return
    setMode('player')
    setTimeout(() => {
      const video = videoRef.current
      if (video) {
        video.src = client.streamUrl(itemId, mediaSourceId)
        video.play().catch(() => {})
        client.reportPlaybackStart(itemId, mediaSourceId)
        progressRef.current = setInterval(() => {
          if (video && !video.paused) {
            const ticks = Math.round(video.currentTime * 10_000_000)
            client.reportPlaybackProgress(itemId, ticks, mediaSourceId)
          }
        }, 10000)
        video.onended = () => {
          const ticks = Math.round(video.duration * 10_000_000)
          client.reportPlaybackStopped(itemId, ticks, mediaSourceId)
          if (progressRef.current) clearInterval(progressRef.current)
        }
      }
    }, 100)
  }

  const handleBackFromPlayer = () => {
    const video = videoRef.current
    if (video && client && selectedItem) {
      const ticks = Math.round(video.currentTime * 10_000_000)
      client.reportPlaybackStopped(selectedItem.Id, ticks)
      video.pause()
      video.src = ''
    }
    if (progressRef.current) clearInterval(progressRef.current)
    setMode('detail')
  }

  const displayItems = searchQuery.length >= 2 ? searchResults : items

  return (
    <main className="min-h-screen bg-vault-950 pt-14">
      {mode === 'auth' && (
        <div className="max-w-md mx-auto px-6 py-20">
          <h1 className="font-display text-3xl font-black mb-2">JellyWrap <span className="text-gold">Media</span></h1>
          <p className="text-zinc-500 mb-8">Connect to your Jellyfin server to browse and play your library.</p>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">{error}</div>}
              <JellyfinAuthForm onConnected={() => {
                if (jellyfinUrl && jellyfinToken && jellyfinUserId) {
                  const c = new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId)
                  setClient(c)
                  setMode('browse')
                  c.getViews().then(views => {
                    setLibraries(views)
                    if (views.length > 0) {
                      setCurrentLib(views[0].Id)
                      loadLibrary(c, views[0].Id)
                    }
                  }).catch(() => {})
                  loadContinueWatching(c)
                }
              }} />
        </div>
      )}

      {mode === 'browse' && client && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-2xl font-bold">JellyWrap</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search library..."
                className="input-field w-64"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {libraries.map((lib) => (
              <button
                key={lib.Id}
                onClick={() => { setCurrentLib(lib.Id); loadLibrary(client, lib.Id) }}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  currentLib === lib.Id ? 'bg-gold text-vault-950 font-semibold' : 'bg-vault-800 text-zinc-400 hover:text-white'
                }`}
              >
                {lib.Name}
              </button>
            ))}
          </div>

          {continueWatching.length > 0 && !searchQuery && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Continue Watching</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {continueWatching.map((item: any) => (
                  <button
                    key={item.Id}
                    onClick={() => handleSelectItem(item.Id)}
                    className="flex-shrink-0 w-40 group"
                  >
                    <div className="w-40 h-24 bg-vault-800 rounded-lg overflow-hidden mb-2 relative">
                      {item.ImageTags?.Primary ? (
                        <img
                          src={client.imageUrl(item.Id, 'Primary', 300)}
                          alt={item.Name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl">&#9654;</div>
                      )}
                      {item.UserData?.PlaybackPositionTicks > 0 && item.RunTimeTicks > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-vault-700">
                          <div
                            className="h-full bg-gold"
                            style={{ width: `${Math.min(100, (item.UserData.PlaybackPositionTicks / (item.RunTimeTicks || 1)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium truncate">{item.Name}</div>
                    <div className="text-xs text-zinc-500 truncate">{item.ProductionYear || ''}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-zinc-500 py-20">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayItems.map((item: any) => (
                <button
                  key={item.Id}
                  onClick={() => handleSelectItem(item.Id)}
                  className="text-left group"
                >
                  <div className="aspect-[2/3] bg-vault-800 rounded-lg overflow-hidden mb-2 relative">
                    {item.ImageTags?.Primary ? (
                      <img
                        src={client.imageUrl(item.Id, 'Primary', 300)}
                        alt={item.Name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <span className="text-3xl">
                          {item.Type === 'Movie' ? 'M' : item.Type === 'Series' ? 'TV' : 'M'}
                        </span>
                      </div>
                    )}
                    {item.UserData?.IsFolder === false && item.UserData?.Played && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                        <span className="text-vault-950 text-xs">&#10003;</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium truncate">{item.Name}</div>
                  <div className="text-xs text-zinc-500 truncate">
                    {item.ProductionYear || ''} {item.Type === 'Movie' ? 'Movie' : item.Type === 'Series' ? 'TV' : ''}
                  </div>
                </button>
              ))}
            </div>
          )}

          {displayItems.length === 0 && !loading && (
            <div className="text-center text-zinc-500 py-20">
              {searchQuery ? 'No results found' : 'No items in this library'}
            </div>
          )}
        </div>
      )}

      {mode === 'detail' && selectedItem && client && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button onClick={() => setMode('browse')} className="text-sm text-zinc-500 hover:text-gold transition-colors mb-6 inline-block">
            &larr; Back to library
          </button>
          <div className="flex gap-8">
            <div className="w-64 flex-shrink-0">
              {selectedItem.ImageTags?.Primary ? (
                <img src={client.imageUrl(selectedItem.Id, 'Primary', 600)} alt={selectedItem.Name} className="w-full rounded-lg" />
              ) : (
                <div className="w-full aspect-[2/3] bg-vault-800 rounded-lg flex items-center justify-center text-zinc-600 text-4xl">M</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-black mb-2">{selectedItem.Name}</h1>
              <div className="flex items-center gap-3 text-sm text-zinc-500 mb-4">
                {selectedItem.ProductionYear && <span>{selectedItem.ProductionYear}</span>}
                {selectedItem.OfficialRating && <span className="px-1.5 py-0.5 bg-vault-700 rounded text-xs">{selectedItem.OfficialRating}</span>}
                {selectedItem.CommunityRating && <span>&#9733; {selectedItem.CommunityRating.toFixed(1)}</span>}
                {selectedItem.RunTimeTicks && (
                  <span>{Math.round(selectedItem.RunTimeTicks / 600_000_000)} min</span>
                )}
              </div>
              {selectedItem.Genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.Genres.map((g: string) => (
                    <span key={g} className="px-2 py-1 bg-vault-800 rounded text-xs text-zinc-400">{g}</span>
                  ))}
                </div>
              )}
              {selectedItem.Overview && (
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">{selectedItem.Overview}</p>
              )}

              {selectedItem.Type !== 'Series' && (
                <button
                  onClick={() => handlePlay(selectedItem.Id)}
                  className="btn-gold"
                >
                  Play
                </button>
              )}

              {selectedItem.MediaSources?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Available Versions</h3>
                  <div className="space-y-2">
                    {selectedItem.MediaSources.map((src: any) => (
                      <button
                        key={src.Id}
                        onClick={() => handlePlay(selectedItem.Id, src.Id)}
                        className="card text-left w-full flex items-center justify-between"
                      >
                        <span className="text-sm">{src.Name || 'Default'}</span>
                        <span className="text-xs text-zinc-500">
                          {src.MediaStreams?.find((s: any) => s.Type === 'Video')?.DisplayTitle || ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'player' && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            autoPlay
          />
          <button
            onClick={handleBackFromPlayer}
            className="absolute top-4 left-4 px-4 py-2 bg-black/60 text-white rounded-lg text-sm hover:bg-black/80 transition-colors"
          >
            &larr; Back
          </button>
        </div>
      )}
    </main>
  )
}
