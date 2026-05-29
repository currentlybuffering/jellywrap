import { Router } from 'express'
import { createCloudServer, getCloudServer, getCloudServerByEmail, updateCloudServerStatus } from '../db-queries.js'
import crypto from 'crypto'
import { execSync } from 'child_process'

const router = Router()

const BASE_PORT = 8100
const MAX_PORT = 8200

function getNextPort(): number {
  const existing = import.meta.url
  const usedPorts = new Set<number>()
  try {
    const result = execSync('docker ps --format "{{.Ports}}" 2>/dev/null || true', { encoding: 'utf-8' })
    const matches = result.matchAll(/:(\d{4,5})->/g)
    for (const m of matches) usedPorts.add(parseInt(m[1]))
  } catch {}
  for (let p = BASE_PORT; p < MAX_PORT; p++) {
    if (!usedPorts.has(p)) return p
  }
  throw new Error('No available ports')
}

function provisionJellyfinInstance(serverId: string, port: number): { url: string; adminToken: string } {
  const adminToken = crypto.randomBytes(16).toString('hex')
  const containerName = `jw-cloud-${serverId.slice(0, 8)}`
  const dataDir = `/opt/jellywrap-cloud/${serverId}`

  try {
    execSync(`mkdir -p ${dataDir}/config ${dataDir}/cache ${dataDir}/media`, { stdio: 'pipe' })

    execSync(
      `docker run -d --name ${containerName} ` +
      `--restart unless-stopped ` +
      `-p ${port}:8096 ` +
      `-v ${dataDir}/config:/config ` +
      `-v ${dataDir}/cache:/cache ` +
      `-v ${dataDir}/media:/media ` +
      `-e JELLYFIN_PublishedServerUrl=http://jellywrap.net:${port} ` +
      `jellyfin/jellyfin:latest`,
      { stdio: 'pipe' }
    )
  } catch (err: any) {
    throw new Error(`Docker provisioning failed: ${err.message}`)
  }

  return {
    url: `http://jellywrap.net:${port}`,
    adminToken,
  }
}

router.post('/signup', (req, res) => {
  const { email, tier, stripeCustomerId, stripeSubscriptionId } = req.body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email required' })
    return
  }

  if (!tier || !['cloud', 'cloud_plus'].includes(tier)) {
    res.status(400).json({ error: 'Tier must be "cloud" or "cloud_plus"' })
    return
  }

  const existing = getCloudServerByEmail(email)
  const activeServer = existing.find(s => s.status === 'active' || s.status === 'pending' || s.status === 'provisioning')
  if (activeServer) {
    res.status(409).json({ error: 'You already have an active server', server: { id: activeServer.id, status: activeServer.status, jellyfin_url: activeServer.jellyfin_url } })
    return
  }

  const server = createCloudServer({
    email,
    tier,
    stripeCustomerId,
    stripeSubscriptionId,
  })

  updateCloudServerStatus(server.id, 'provisioning')

  try {
    const port = getNextPort()
    const { url, adminToken } = provisionJellyfinInstance(server.id, port)
    updateCloudServerStatus(server.id, 'active', { jellyfin_url: url, admin_token: adminToken, port })
    const updated = getCloudServer(server.id)
    res.status(201).json({
      ok: true,
      server: {
        id: updated!.id,
        status: updated!.status,
        jellyfin_url: updated!.jellyfin_url,
        tier: updated!.tier,
        storage_gb: updated!.storage_gb,
      },
    })
  } catch (err: any) {
    updateCloudServerStatus(server.id, 'pending')
    res.status(500).json({ error: `Provisioning failed: ${err.message}`, serverId: server.id })
  }
})

router.get('/status/:id', (req, res) => {
  const server = getCloudServer(req.params.id)
  if (!server) {
    res.status(404).json({ error: 'Server not found' })
    return
  }
  res.json({
    id: server.id,
    email: server.email,
    tier: server.tier,
    status: server.status,
    jellyfin_url: server.jellyfin_url,
    storage_gb: server.storage_gb,
    custom_domain: server.custom_domain,
    created_at: server.created_at,
  })
})

router.get('/my-servers', (req, res) => {
  const email = req.query.email as string
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Email query param required' })
    return
  }
  const servers = getCloudServerByEmail(email)
  res.json(servers.map(s => ({
    id: s.id,
    tier: s.tier,
    status: s.status,
    jellyfin_url: s.jellyfin_url,
    storage_gb: s.storage_gb,
    custom_domain: s.custom_domain,
    created_at: s.created_at,
  })))
})

export default router
