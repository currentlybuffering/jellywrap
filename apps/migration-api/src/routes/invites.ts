import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db.js'
import fetch from 'node-fetch'

const router = Router()

db.exec(`
  CREATE TABLE IF NOT EXISTS invite_links (
    id TEXT PRIMARY KEY,
    jellyfin_url TEXT NOT NULL,
    jellyfin_admin_token TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    max_uses INTEGER DEFAULT 1,
    use_count INTEGER DEFAULT 0,
    expires_at TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    policy TEXT DEFAULT '{}',
    used_by TEXT DEFAULT '[]'
  );
`)

router.post('/create', async (req, res) => {
  try {
    const { jellyfinUrl, jellyfinToken, label, maxUses, expiresHours, policy } = req.body
    if (!jellyfinUrl || !jellyfinToken) {
      res.status(400).json({ error: 'jellyfinUrl and jellyfinToken required' })
      return
    }

    const id = uuid().slice(0, 8)
    const expiresAt = expiresHours
      ? new Date(Date.now() + expiresHours * 3600000).toISOString()
      : null

    db.prepare(`
      INSERT INTO invite_links (id, jellyfin_url, jellyfin_admin_token, label, max_uses, expires_at, policy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, jellyfinUrl.replace(/\/+$/, ''), jellyfinToken, label || '', maxUses || 1, expiresAt, JSON.stringify(policy || {}))

    res.json({ inviteId: id, url: `https://jellywrap.net/invite/${id}` })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/list', async (req, res) => {
  try {
    const { jellyfinUrl } = req.body
    if (!jellyfinUrl) { res.status(400).json({ error: 'jellyfinUrl required' }); return }
    const links = db.prepare(
      'SELECT id, jellyfin_url, label, max_uses, use_count, expires_at, created_at, policy FROM invite_links WHERE jellyfin_url = ? ORDER BY created_at DESC'
    ).all(jellyfinUrl.replace(/\/+$/, ''))
    res.json({ links })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/redeem/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params
    const { username, password } = req.body
    if (!username) { res.status(400).json({ error: 'username required' }); return }

    const link = db.prepare('SELECT * FROM invite_links WHERE id = ?').get(inviteId) as any
    if (!link) { res.status(404).json({ error: 'Invite not found' }); return }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      res.status(410).json({ error: 'Invite expired' }); return
    }
    if (link.use_count >= link.max_uses) {
      res.status(410).json({ error: 'Invite already used' }); return
    }

    const policy = JSON.parse(link.policy)
    const userData = await fetch(`${link.jellyfin_url}/Users/New`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': link.jellyfin_admin_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Name: username, Password: password || '' }),
  }).then(r => r.json()) as any

  if (userData.Id) {
      const defaultPolicy: Record<string, any> = {
        IsAdministrator: false,
        EnableMediaPlayback: true,
        EnableLiveTvAccess: false,
        EnableLiveTvManagement: false,
        EnableContentDeletion: false,
        EnableContentDownloading: false,
        EnableRemoteAccess: true,
        EnablePublicSharing: false,
        ...policy,
      }
      await fetch(`${link.jellyfin_url}/Users/${userData.Id}/Policy`, {
        method: 'POST',
        headers: {
          'X-Emby-Token': link.jellyfin_admin_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultPolicy),
      })

      const usedBy = JSON.parse(link.used_by || '[]')
      usedBy.push({ userId: userData.Id, username, redeemedAt: new Date().toISOString() })

      db.prepare(`
        UPDATE invite_links SET use_count = use_count + 1, used_by = ? WHERE id = ?
      `).run(JSON.stringify(usedBy), inviteId)
    }

    res.json({ ok: true, userId: (userData as any).Id, username: (userData as any).Name })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/:inviteId', async (req, res) => {
  try {
    const link = db.prepare(
      'SELECT id, jellyfin_url, label, max_uses, use_count, expires_at, created_at, policy FROM invite_links WHERE id = ?'
    ).get(req.params.inviteId) as any
    if (!link) { res.status(404).json({ error: 'Invite not found' }); return }
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      res.status(410).json({ error: 'Invite expired' }); return
    }
    if (link.use_count >= link.max_uses) {
      res.status(410).json({ error: 'Invite already used' }); return
    }
    res.json(link)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/delete/:inviteId', async (req, res) => {
  try {
    db.prepare('DELETE FROM invite_links WHERE id = ?').run(req.params.inviteId)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
