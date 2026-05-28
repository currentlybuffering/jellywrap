import { Router } from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuid } from 'uuid'
import http from 'http'

interface WatchRoom {
  id: string
  name: string
  itemId: string
  jellyfinUrl: string
  ownerId: string
  peers: Map<string, { ws: WebSocket; name: string; ready: boolean }>
  state: {
    playing: boolean
    positionTicks: number
    lastSyncAt: number
  }
}

const rooms = new Map<string, WatchRoom>()

export function setupWatchWSS(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/watch/ws' })

  wss.on('connection', (ws) => {
    let peerId = uuid()
    let currentRoom: string | null = null

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        switch (msg.type) {
          case 'join': {
            const { roomId, name } = msg
            const room = rooms.get(roomId)
            if (!room) {
              ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
              return
            }
            currentRoom = roomId
            room.peers.set(peerId, { ws, name: name || 'Anonymous', ready: false })
            ws.send(JSON.stringify({
              type: 'joined',
              roomId,
              peerId,
              peerCount: room.peers.size,
              state: room.state,
            }))
            broadcast(room, {
              type: 'peer-joined',
              peerId,
              peerName: name || 'Anonymous',
              peerCount: room.peers.size,
            }, peerId)
            break
          }

          case 'create': {
            const { name, itemId, jellyfinUrl, ownerName } = msg
            const roomId = uuid().slice(0, 8)
            const room: WatchRoom = {
              id: roomId,
              name: name || 'Watch Party',
              itemId,
              jellyfinUrl,
              ownerId: peerId,
              peers: new Map(),
              state: { playing: false, positionTicks: 0, lastSyncAt: Date.now() },
            }
            rooms.set(roomId, room)
            currentRoom = roomId
            room.peers.set(peerId, { ws, name: ownerName || 'Host', ready: false })
            ws.send(JSON.stringify({
              type: 'created',
              roomId,
              peerId,
              inviteUrl: `https://jellywrap.net/watch/${roomId}`,
            }))
            break
          }

          case 'play': {
            const room = currentRoom ? rooms.get(currentRoom) : null
            if (!room) return
            room.state.playing = true
            room.state.positionTicks = msg.positionTicks ?? room.state.positionTicks
            room.state.lastSyncAt = Date.now()
            broadcast(room, { type: 'play', positionTicks: room.state.positionTicks })
            break
          }

          case 'pause': {
            const room = currentRoom ? rooms.get(currentRoom) : null
            if (!room) return
            room.state.playing = false
            room.state.positionTicks = msg.positionTicks ?? room.state.positionTicks
            room.state.lastSyncAt = Date.now()
            broadcast(room, { type: 'pause', positionTicks: room.state.positionTicks })
            break
          }

          case 'seek': {
            const room = currentRoom ? rooms.get(currentRoom) : null
            if (!room) return
            room.state.positionTicks = msg.positionTicks
            room.state.lastSyncAt = Date.now()
            broadcast(room, { type: 'seek', positionTicks: msg.positionTicks })
            break
          }

          case 'ready': {
            const room = currentRoom ? rooms.get(currentRoom) : null
            if (!room) return
            const peer = room.peers.get(peerId)
            if (peer) peer.ready = true
            broadcast(room, { type: 'peer-ready', peerId, peerCount: room.peers.size })
            break
          }

          case 'chat': {
            const room = currentRoom ? rooms.get(currentRoom) : null
            if (!room) return
            const peer = room.peers.get(peerId)
            broadcast(room, {
              type: 'chat',
              peerId,
              peerName: peer?.name || 'Anonymous',
              message: String(msg.message || '').slice(0, 500),
            })
            break
          }

          case 'sync-request': {
            const room = currentRoom ? rooms.get(currentRoom) : null
            if (!room) return
            ws.send(JSON.stringify({
              type: 'sync-response',
              state: room.state,
              peerCount: room.peers.size,
            }))
            break
          }
        }
      } catch { /* ignore malformed messages */ }
    })

    ws.on('close', () => {
      if (currentRoom) {
        const room = rooms.get(currentRoom)
        if (room) {
          const peer = room.peers.get(peerId)
          room.peers.delete(peerId)
          broadcast(room, {
            type: 'peer-left',
            peerId,
            peerName: peer?.name || 'Anonymous',
            peerCount: room.peers.size,
          })
          if (room.peers.size === 0) {
            rooms.delete(currentRoom)
          }
        }
      }
    })
  })
}

function broadcast(room: WatchRoom, msg: any, excludePeer?: string) {
  const data = JSON.stringify(msg)
  for (const [id, peer] of room.peers) {
    if (id !== excludePeer && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(data)
    }
  }
}

const router = Router()

router.get('/rooms', (_req, res) => {
  const list = Array.from(rooms.values()).map(r => ({
    id: r.id,
    name: r.name,
    itemId: r.itemId,
    peerCount: r.peers.size,
    playing: r.state.playing,
  }))
  res.json({ rooms: list })
})

router.get('/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id)
  if (!room) { res.status(404).json({ error: 'Room not found' }); return }
  res.json({
    id: room.id,
    name: room.name,
    itemId: room.itemId,
    peerCount: room.peers.size,
    playing: room.state.playing,
    positionTicks: room.state.positionTicks,
  })
})

export default router
