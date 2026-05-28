import { Router } from 'express'
import { JellyfinClient } from '../services/jellyfin-client.js'
import fetch from 'node-fetch'

const router = Router()

function makeClient(req: any): { client: JellyfinClient; url: string; token: string; userId: string } {
  const { jellyfinUrl, jellyfinToken, jellyfinUserId } = req.body
  if (!jellyfinUrl || !jellyfinToken || !jellyfinUserId) {
    throw new Error('jellyfinUrl, jellyfinToken, jellyfinUserId required')
  }
  return {
    client: new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId),
    url: jellyfinUrl.replace(/\/+$/, ''),
    token: jellyfinToken,
    userId: jellyfinUserId,
  }
}

router.get('/users', async (_req, res) => {
  res.json({ error: 'Use POST with jellyfinUrl, jellyfinToken, jellyfinUserId in body' })
})

router.post('/users/list', async (req, res) => {
  try {
    const { url, token } = makeClient(req)
    const data = await fetch(`${url}/Users`, {
      headers: { 'X-Emby-Token': token, 'Accept': 'application/json' },
  }).then(r => r.json()) as any
  const users = (data as any[]).map((u: any) => ({
      id: u.Id,
      name: u.Name,
      hasPassword: u.HasPassword,
      isAdmin: u.Policy?.IsAdministrator || false,
      isDisabled: u.Policy?.IsDisabled || false,
      maxSessions: u.Policy?.MaxActiveSessions || 0,
      enableLiveTv: u.Policy?.EnableLiveTvAccess || false,
      enableMediaPlayback: u.Policy?.EnableMediaPlayback !== false,
      enableRemoteAccess: u.Policy?.EnableRemoteAccess || true,
      blockedTags: u.Policy?.BlockedTags || [],
      enableAllFolders: u.Policy?.EnableAllFolders || true,
      enabledFolders: u.Policy?.EnabledFolders || [],
      accessSchedules: u.Policy?.AccessSchedules || [],
    }))
    res.json({ users })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/users/create', async (req, res) => {
  try {
    const { url, token } = makeClient(req)
    const { name, password, isAdmin } = req.body
    if (!name) { res.status(400).json({ error: 'name required' }); return }
    const data = await fetch(`${url}/Users/New`, {
      method: 'POST',
      headers: { 'X-Emby-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, Password: password || '' }),
  }).then(r => r.json()) as any
  if ((data as any).Id && isAdmin) {
    await fetch(`${url}/Users/${(data as any).Id}/Policy`, {
        method: 'POST',
        headers: { 'X-Emby-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ IsAdministrator: true }),
      })
    }
    res.json({ user: { id: (data as any).Id, name: (data as any).Name } })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/users/:userId/policy', async (req, res) => {
  try {
    const { url, token } = makeClient(req)
    const { userId } = req.params
    const policy = req.body.policy
    if (!policy) { res.status(400).json({ error: 'policy object required' }); return }
    await fetch(`${url}/Users/${userId}/Policy`, {
      method: 'POST',
      headers: { 'X-Emby-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    })
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/users/:userId/delete', async (req, res) => {
  try {
    const { url, token } = makeClient(req)
    const { userId } = req.params
    await fetch(`${url}/Users/${userId}`, {
      method: 'DELETE',
      headers: { 'X-Emby-Token': token },
    })
    res.json({ ok: true, deleted: userId })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/users/:userId/password', async (req, res) => {
  try {
    const { url, token } = makeClient(req)
    const { userId } = req.params
    const { currentPw, newPw } = req.body
    await fetch(`${url}/Users/${userId}/Password`, {
      method: 'POST',
      headers: { 'X-Emby-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Id: userId, CurrentPw: currentPw || '', NewPw: newPw || '' }),
    })
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
