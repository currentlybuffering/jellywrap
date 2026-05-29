'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useVault } from '@/lib/store'
import { JellyfinClient } from '@/lib/jellyfin'
import { Play, Pause, ArrowLeft, Search, ChevronRight, Star, Clock, Film, Tv } from 'lucide-react'

type ViewMode = 'browse' | 'detail' | 'player'

export default function MediaPage() {
  const { connected, jellyfinUrl, jellyfinToken, jellyfinUserId } = useVault()
  const [client, setClient] = useState<JellyfinClient | null>(null)
  const [mode, setMode] = useState<ViewMode>('browse')
  const [libraries, setLibraries] = useState<any[]>([])
  const [currentLib, setCurrentLib] = useState<string>('')
  const [items, setItems] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [continueWatching, setContinueWatching] = useState<any[]>([])
  const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isDemo = params.get('demo') === 'true'
    if (!connected && isDemo) {
      const c = new JellyfinClient('https://demo.jellyfin.org/stable', '', '')
      setClient(c)
      setMode('browse')
      const { setJellyfinAuth, setConnected } = useVault.getState()
      fetch('/api/jellyfin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: 'https://demo.jellyfin.org/stable',
          username: 'demo',
          password: '',
          deviceId: localStorage.getItem('jw-device-id') || 'jw-' + crypto.randomUUID(),
        }),
      }).then(res => res.json()).then(data => {
        if (data.token && data.userId) {
          setJellyfinAuth(data.serverUrl || 'https://demo.jellyfin.org/stable', data.token, data.userId)
          setConnected(true)
          const authedClient = new JellyfinClient(data.serverUrl || 'https://demo.jellyfin.org/stable', data.token, data.userId)
          setClient(authedClient)
          loadAll(authedClient)
        }
      }).catch(() => {
        setError('Could not connect to demo server. Try again.')
      })
      return
    }

    if (connected && jellyfinUrl && jellyfinToken && jellyfinUserId) {
      const c = new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId)
      setClient(c)
      setMode('browse')
      loadAll(c)
    }
  }, [connected, jellyfinUrl, jellyfinToken, jellyfinUserId])

  const loadAll = (c: JellyfinClient) => {
    c.getViews().then(views => {
      setLibraries(views)
      if (views.length > 0) {
        setCurrentLib(views[0].Id)
        loadLibrary(c, views[0].Id)
      }
    }).catch((err: any) => setError(err.message || 'Could not load libraries'))
    loadContinueWatching(c)
    loadRecentlyAdded(c)
  }

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
    try { setContinueWatching(await c.getContinueWatching()) } catch { /* non-critical */ }
  }, [])

  const loadRecentlyAdded = useCallback(async (c: JellyfinClient) => {
    try {
      const data = await c.getItems({ SortBy: 'DateCreated', SortOrder: 'Descending', Limit: '12' })
      setRecentlyAdded(data.items)
    } catch { /* non-critical */ }
  }, [])

  useEffect(() => {
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!client || query.length < 2) { setSearchResults([]); return }
    try { setSearchResults(await client.search(query)) } catch { /* ignore */ }
  }

  const handleSelectItem = async (itemId: string) => {
    if (!client) return
    try {
      setSelectedItem(await client.getItem(itemId))
      setMode('detail')
    } catch (err: any) { setError(err.message) }
  }

  const handlePlay = async (itemId: string, mediaSourceId?: string) => {
    if (!client) return
    setMode('player')
    setAutoplayBlocked(false)
    setTimeout(() => {
      const video = videoRef.current
      if (video) {
        video.src = client.streamUrl(itemId, mediaSourceId)
        video.play().catch(() => setAutoplayBlocked(true))
        client.reportPlaybackStart(itemId, mediaSourceId)
        progressRef.current = setInterval(() => {
          if (video && !video.paused) {
            client.reportPlaybackProgress(itemId, Math.round(video.currentTime * 10_000_000), mediaSourceId)
          }
        }, 10000)
        video.onended = () => {
          client.reportPlaybackStopped(itemId, Math.round(video.duration * 10_000_000), mediaSourceId)
          if (progressRef.current) clearInterval(progressRef.current)
        }
      }
    }, 100)
  }

  const handleBackFromPlayer = () => {
    const video = videoRef.current
    if (video && client && selectedItem) {
      client.reportPlaybackStopped(selectedItem.Id, Math.round(video.currentTime * 10_000_000))
      video.pause()
      video.src = ''
    }
    if (progressRef.current) clearInterval(progressRef.current)
    setMode('detail')
  }

  const displayItems = searchQuery.length >= 2 ? searchResults : items

const renderItemRow = (rowItems: any[], title: string, Icon?: typeof Film) => {
  if (rowItems.length === 0) return null
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 px-1">
        {Icon && <Icon className="w-4 h-4 text-gold" />}
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{title}</h2>
          <span className="text-xs text-zinc-600">{rowItems.length}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {rowItems.map((item: any) => renderCard(item))}
        </div>
      </div>
    )
  }

  const renderCard = (item: any) => (
    <button
      key={item.Id}
      onClick={() => handleSelectItem(item.Id)}
      className="text-left group relative"
    >
      <div className="aspect-[2/3] bg-vault-800 rounded-lg overflow-hidden mb-1.5 relative ring-1 ring-white/[0.04] group-hover:ring-gold/30 transition-all group-hover:shadow-[0_0_20px_rgba(232,197,71,0.1)]">
        {item.ImageTags?.Primary ? (
          <img
            src={client!.imageUrl(item.Id, 'Primary', 300)}
            alt={item.Name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-vault-700 to-vault-800">
            <span className="text-3xl text-zinc-600">
              {item.Type === 'Movie' ? <Film className="w-8 h-8" /> : item.Type === 'Series' ? <Tv className="w-8 h-8" /> : <Film className="w-8 h-8" />}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <div className="w-10 h-10 rounded-full bg-gold/90 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 text-vault-950 ml-0.5" />
          </div>
        </div>
        {item.UserData?.PlaybackPositionTicks > 0 && item.RunTimeTicks > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-vault-700/80">
            <div className="h-full bg-gold rounded-r" style={{ width: `${Math.min(100, (item.UserData.PlaybackPositionTicks / (item.RunTimeTicks || 1)) * 100)}%` }} />
          </div>
        )}
        {item.UserData?.IsFolder === false && item.UserData?.Played && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-gold rounded-full flex items-center justify-center shadow">
            <span className="text-vault-950 text-[10px] font-bold">&#10003;</span>
          </div>
        )}
      </div>
      <div className="text-xs font-medium truncate text-zinc-300 group-hover:text-gold transition-colors">{item.Name}</div>
      <div className="text-[10px] text-zinc-600 truncate">
        {item.ProductionYear || ''} {item.Type === 'Movie' ? '' : item.Type === 'Series' ? '· Series' : ''}
      </div>
    </button>
  )

  if (mode === 'player') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-contain" controls autoPlay />
        {autoplayBlocked && (
          <button
            onClick={() => { videoRef.current?.play().then(() => setAutoplayBlocked(false)).catch(() => {}) }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center mx-auto mb-3">
                <Play className="w-7 h-7 text-vault-950 ml-1" />
              </div>
              <p className="text-white font-medium">Click to Play</p>
              <p className="text-xs text-zinc-400 mt-1">Browser blocked autoplay</p>
            </div>
          </button>
        )}
        <button onClick={handleBackFromPlayer} className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-black/80 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    )
  }

  if (mode === 'detail' && selectedItem && client) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
        <button onClick={() => setMode('browse')} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-gold transition-colors mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
            {selectedItem.ImageTags?.Primary ? (
              <img src={client.imageUrl(selectedItem.Id, 'Primary', 600)} alt={selectedItem.Name} className="w-full rounded-xl shadow-2xl" />
            ) : (
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-vault-700 to-vault-800 rounded-xl flex items-center justify-center">
                <Film className="w-16 h-16 text-zinc-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-black mb-3">{selectedItem.Name}</h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 mb-4">
              {selectedItem.ProductionYear && <span>{selectedItem.ProductionYear}</span>}
              {selectedItem.OfficialRating && <span className="px-1.5 py-0.5 bg-vault-700/80 rounded text-xs border border-vault-600/50">{selectedItem.OfficialRating}</span>}
              {selectedItem.CommunityRating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                  {selectedItem.CommunityRating.toFixed(1)}
                </span>
              )}
              {selectedItem.RunTimeTicks && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(selectedItem.RunTimeTicks / 600_000_000)} min
                </span>
              )}
            </div>

            {selectedItem.Genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedItem.Genres.map((g: string) => (
                  <span key={g} className="px-2.5 py-1 bg-vault-800/80 rounded-full text-[11px] text-zinc-400 border border-vault-700/50">{g}</span>
                ))}
              </div>
            )}

            {selectedItem.Overview && (
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">{selectedItem.Overview}</p>
            )}

            {selectedItem.Type !== 'Series' && (
              <button onClick={() => handlePlay(selectedItem.Id)} className="btn-gold inline-flex items-center gap-2">
                <Play className="w-4 h-4" />
                Play
              </button>
            )}

            {selectedItem.MediaSources?.length > 0 && selectedItem.MediaSources.length > 1 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Available Versions</h3>
                <div className="space-y-2">
                  {selectedItem.MediaSources.map((src: any) => (
                    <button
                      key={src.Id}
                      onClick={() => handlePlay(selectedItem.Id, src.Id)}
                      className="card-glow text-left w-full flex items-center justify-between"
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
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">{error}</div>}

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search your library..."
          className="input-field pl-11 bg-vault-900/50"
        />
      </div>

      {/* Library tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        {libraries.map((lib) => (
          <button
            key={lib.Id}
            onClick={() => { setCurrentLib(lib.Id); client && loadLibrary(client, lib.Id) }}
            className={`px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-all min-h-[40px] ${
              currentLib === lib.Id
                ? 'bg-gold/10 text-gold border border-gold/20'
                : 'text-zinc-500 hover:text-white border border-transparent hover:bg-vault-800/50'
            }`}
          >
            {lib.Name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin-slow" />
        </div>
      ) : (
        <>
          {searchQuery.length >= 2 ? (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Search className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Results for &ldquo;{searchQuery}&rdquo;</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {displayItems.map((item: any) => renderCard(item))}
              </div>
              {displayItems.length === 0 && (
                <div className="text-center py-20 text-zinc-600">
                  <Search className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                  <p>No results found</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {renderItemRow(continueWatching, 'Continue Watching', Clock)}
              {renderItemRow(recentlyAdded, 'Recently Added', Film)}

              <div className="mb-3 flex items-center gap-2 px-1">
                <Film className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">All Media</h2>
                <span className="text-xs text-zinc-600">{totalItems} items</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {displayItems.map((item: any) => renderCard(item))}
              </div>

              {displayItems.length === 0 && !loading && (
                <div className="text-center py-20 text-zinc-600">
                  <Film className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                  <p>No items in this library</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
