'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useVault } from '@/lib/store'
import ItemPicker from '@/components/item-picker'
import { AlertCircle } from 'lucide-react'

interface PeerInfo {
  peerId: string
  peerName: string
}

interface ChatMsg {
  peerName: string
  message: string
  ts: number
}

function formatTime(ticks: number): string {
  const totalSec = Math.floor(ticks / 10000000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function WatchPage() {
  const { connected, jellyfinUrl, jellyfinToken, jellyfinUserId } = useVault()
  const isDemo = jellyfinUrl?.includes('demo.jellyfin.org')
  const [displayName, setDisplayName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [roomName, setRoomName] = useState('')
  const [itemId, setItemId] = useState('')
  const [itemName, setItemName] = useState('')
  const [myPeerId, setMyPeerId] = useState('')
  const [peers, setPeers] = useState<PeerInfo[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [positionTicks, setPositionTicks] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [error, setError] = useState('')
  const [inRoom, setInRoom] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.jellywrap.net'
  const myName = displayName || 'You'

  const handleWSMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case 'joined':
        setMyPeerId(msg.peerId)
        setIsPlaying(msg.state?.playing ?? false)
        setPositionTicks(msg.state?.positionTicks ?? 0)
        if (msg.roomName) setRoomName(msg.roomName)
        setInRoom(true)
        sessionStorage.setItem('jw-watch-name', myName)
        break
      case 'created':
        setMyPeerId(msg.peerId)
        setInviteUrl(msg.inviteUrl)
        setRoomId(msg.roomId)
        setInRoom(true)
        sessionStorage.setItem('jw-watch-room', msg.roomId)
        sessionStorage.setItem('jw-watch-name', myName)
        break
      case 'peer-joined':
        setPeers(prev => [...prev.filter(p => p.peerId !== msg.peerId), { peerId: msg.peerId, peerName: msg.peerName }])
        break
      case 'peer-left':
        setPeers(prev => prev.filter(p => p.peerId !== msg.peerId))
        break
      case 'play':
        setIsPlaying(true)
        setPositionTicks(msg.positionTicks)
        if (videoRef.current) {
          videoRef.current.currentTime = msg.positionTicks / 10000000
          videoRef.current.play().catch(() => { setAutoplayBlocked(true) })
        }
        break
      case 'pause':
        setIsPlaying(false)
        setPositionTicks(msg.positionTicks)
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = msg.positionTicks / 10000000
        }
        break
      case 'seek':
        setPositionTicks(msg.positionTicks)
        if (videoRef.current) {
          videoRef.current.currentTime = msg.positionTicks / 10000000
        }
        break
      case 'chat':
        setChatMessages(prev => [...prev, { peerName: msg.peerName, message: msg.message, ts: Date.now() }])
        break
      case 'error':
        setError(msg.message)
        break
    }
  }, [])

  const connectWS = useCallback((id: string, joinType: 'create' | 'join') => {
    const wsUrl = API_BASE.replace(/^http/, 'ws') + '/watch/ws'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (joinType === 'join') {
        ws.send(JSON.stringify({ type: 'join', roomId: id, name: myName }))
      }
    }

    ws.onmessage = (event) => {
      try { handleWSMessage(JSON.parse(event.data)) } catch { /* ignore */ }
    }

    ws.onclose = () => {
      setError('Disconnected from room')
      sessionStorage.removeItem('jw-watch-room')
    }
    return ws
  }, [API_BASE, handleWSMessage, myName])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    if (!connected) return
    const savedRoom = sessionStorage.getItem('jw-watch-room')
    const savedName = sessionStorage.getItem('jw-watch-name')
    if (savedRoom && savedName && !inRoom) {
      setDisplayName(savedName)
      setRoomId(savedRoom)
    }
  }, [connected])

  const createRoom = () => {
    if (!itemId) return
    const wsUrl = API_BASE.replace(/^http/, 'ws') + '/watch/ws'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'create',
        name: roomName || 'Watch Party',
        itemId,
        jellyfinUrl,
        ownerName: myName,
      }))
    }

    ws.onmessage = (event) => {
      try { handleWSMessage(JSON.parse(event.data)) } catch { /* ignore */ }
    }

    ws.onclose = () => { setError('Disconnected from room') }
  }

  const joinRoom = () => {
    if (!roomId.trim()) return
    connectWS(roomId, 'join')
    setInRoom(true)
  }

  const sendPlay = () => {
    const ticks = videoRef.current ? Math.floor(videoRef.current.currentTime * 10000000) : positionTicks
    wsRef.current?.send(JSON.stringify({ type: 'play', positionTicks: ticks }))
    setIsPlaying(true)
  }

  const sendPause = () => {
    const ticks = videoRef.current ? Math.floor(videoRef.current.currentTime * 10000000) : positionTicks
    wsRef.current?.send(JSON.stringify({ type: 'pause', positionTicks: ticks }))
    setIsPlaying(false)
  }

  const sendSeek = (ticks: number) => {
    wsRef.current?.send(JSON.stringify({ type: 'seek', positionTicks: ticks }))
    setPositionTicks(ticks)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    wsRef.current?.send(JSON.stringify({ type: 'chat', message: chatInput }))
    setChatMessages(prev => [...prev, { peerName: myName, message: chatInput, ts: Date.now() }])
    setChatInput('')
  }

  const copyInvite = () => { navigator.clipboard.writeText(inviteUrl) }

  const videoSrc = itemId && jellyfinToken && jellyfinUrl
    ? `${jellyfinUrl}/Videos/${itemId}/stream?static=true&api_key=${jellyfinToken}`
    : ''

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl sm:text-3xl font-black mb-1">Watch <span className="text-gold">Together</span></h1>
      <p className="text-sm text-zinc-500 mb-6">Sync playback with friends. No Plex Pass required.</p>

      {isDemo && (
        <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="text-amber-300 font-medium">Demo mode</span>
            <span className="text-zinc-400"> — Watch Together requires your own Jellyfin server. The demo server doesn't support direct stream access needed for synced playback.</span>
          </div>
        </div>
      )}

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">{error}</div>}

    {!connected && (
      <div className="text-center py-16 text-zinc-500">
        Connect to Jellyfin first using the sidebar.
      </div>
    )}

    {connected && !inRoom && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-glow">
              <h2 className="font-semibold text-lg mb-4">Create a Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Your Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How others see you" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Room Name</label>
                  <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Movie Night" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Pick Something to Watch</label>
                  <ItemPicker value={itemId} onChange={(id, name) => { setItemId(id); setItemName(name) }} placeholder="Search for a movie or show..." />
                  {itemName && <p className="text-xs text-zinc-500 mt-1.5">Selected: <span className="text-gold">{itemName}</span></p>}
                </div>
                <button onClick={createRoom} disabled={!itemId} className="btn-gold w-full">Create Room</button>
              </div>
            </div>

            <div className="card-glow">
              <h2 className="font-semibold text-lg mb-4">Join Existing Room</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Your Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How others see you" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Room Code</label>
                  <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="abc12345" className="input-field" />
                </div>
                <button onClick={joinRoom} disabled={!roomId.trim()} className="btn-outline w-full">Join Room</button>
              </div>
            </div>
          </div>
        )}

        {connected && inRoom && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            {videoSrc ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full"
                  onPlay={() => { setAutoplayBlocked(false); if (!isPlaying) sendPlay() }}
                  onPause={() => { if (isPlaying) sendPause() }}
                  onSeeked={() => {
                    if (videoRef.current) {
                      sendSeek(Math.floor(videoRef.current.currentTime * 10000000))
                    }
                  }}
                />
                {autoplayBlocked && (
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play().then(() => setAutoplayBlocked(false)).catch(() => {})
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/70 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-3 text-gold">&#x25B6;</div>
                      <p className="text-zinc-300 font-medium">Click to Play</p>
                      <p className="text-xs text-zinc-500 mt-1">Browser blocked autoplay</p>
                    </div>
                  </button>
                )}
              </>
            ) : (
                  <div className="flex items-center justify-center h-full text-zinc-600">
                    <div className="text-center">
                      <div className="text-5xl mb-3">&#x25B6;</div>
                      <p>Waiting for stream...</p>
                      <p className="text-xs mt-2">Playback syncs automatically with all peers</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button onClick={isPlaying ? sendPause : sendPlay} className="btn-gold px-6">
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <span className="text-sm text-zinc-500 font-mono">
                  {formatTime(positionTicks)}
                </span>
                <div className="flex-1" />
                {inviteUrl && (
                  <button onClick={copyInvite} className="btn-outline text-xs">Copy Invite Link</button>
                )}
              </div>

              <div className="card-glow">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-zinc-600'}`} />
                  <span className="text-sm text-zinc-400">{isPlaying ? 'Playing' : 'Paused'}</span>
                  <span className="text-sm text-zinc-600 ml-auto">{roomName || 'Watch Party'}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full">{myName}</span>
                  {peers.map(p => (
                    <span key={p.peerId} className="text-xs bg-vault-700 text-zinc-400 px-2 py-1 rounded-full">
                      {p.peerName}
                    </span>
                  ))}
                  {peers.length === 0 && (
                    <span className="text-xs text-zinc-600">Share the invite link to add viewers</span>
                  )}
                </div>
              </div>
            </div>

            <div className="card-glow flex flex-col h-[600px]">
              <div className="font-semibold mb-3 pb-3 border-b border-vault-600/50">
                Chat ({peers.length + 1} {peers.length + 1 === 1 ? 'viewer' : 'viewers'})
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {chatMessages.length === 0 && (
                  <p className="text-zinc-600 text-sm text-center py-8">No messages yet</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i}>
                    <span className="text-xs text-gold font-semibold">{msg.peerName}</span>
                    <span className="text-xs text-zinc-600 ml-2">
                      {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-sm text-zinc-300">{msg.message}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button onClick={sendChat} disabled={!chatInput.trim()} className="btn-gold px-4">Send</button>
              </div>
            </div>
          </div>
        )}
  </div>
  )
}
