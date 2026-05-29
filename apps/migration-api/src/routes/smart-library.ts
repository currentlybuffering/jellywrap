import { Router } from 'express'
import { JellyfinClient } from '../services/jellyfin-client.js'
import { findDuplicates, type DuplicateGroup } from '../services/duplicate-detector.js'
import { findSubtitles, type SubtitleResult } from '../services/subtitle-hunter.js'
import { findGaps, type GapResult } from '../services/gap-finder.js'

const router = Router()

function makeClient(req: any): { client: JellyfinClient; userId: string } {
  const { jellyfinUrl, jellyfinToken, jellyfinUserId } = req.body
  if (!jellyfinUrl || !jellyfinToken || !jellyfinUserId) {
    throw new Error('jellyfinUrl, jellyfinToken, jellyfinUserId required')
  }
  return { client: new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId), userId: jellyfinUserId }
}

router.post('/duplicates', async (req, res) => {
  try {
    const { client } = makeClient(req)
    const { libraryId } = req.body
    const groups = await findDuplicates(client, libraryId)
    res.json({ duplicates: groups, count: groups.length, totalItems: groups.reduce((s, g) => s + g.items.length, 0) })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/duplicates/:itemId/remove', async (req, res) => {
  try {
    const { client } = makeClient(req)
    const { itemId } = req.params
    await client.req(`/Items/${itemId}`, { method: 'DELETE' })
    res.json({ ok: true, removed: itemId })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/subtitles/:itemId', async (req, res) => {
  try {
    const { client } = makeClient(req)
    const { itemId } = req.params
    if (!process.env.OPENSUBTITLES_API_KEY) {
      res.json({ subtitles: [], count: 0, warning: 'OPENSUBTITLES_API_KEY not configured. Subtitle search is unavailable.' })
      return
    }
    const results = await findSubtitles(client, itemId)
    res.json({ subtitles: results, count: results.length })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/gaps', async (req, res) => {
  try {
    const { client } = makeClient(req)
    const { libraryId } = req.body
    if (!process.env.TMDB_API_KEY) {
      res.json({ gaps: [], count: 0, totalMissing: 0, warning: 'TMDB_API_KEY not configured. Gap finder is unavailable.' })
      return
    }
    const gaps = await findGaps(client, libraryId)
    res.json({ gaps, count: gaps.length, totalMissing: gaps.reduce((s, g) => s + g.totalMissing, 0) })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
