import { Router } from 'express'
import {
  createMigration, getMigration, listMigrations,
  updateMigrationStatus, updateMigrationCounts,
  insertMigrationItem, getMigrationItems, updateMigrationItem,
} from '../db-queries.js'
import { PlexClient } from '../services/plex-client.js'
import { JellyfinClient } from '../services/jellyfin-client.js'
import { matchItem, migrateWatchStatus, migrateRating } from '../services/matcher.js'
import type { PlexItem } from '../services/plex-client.js'

const router = Router()

const activeJobs = new Map<string, AbortController>()

router.post('/', async (req, res) => {
  const { plexUrl, plexToken, jellyfinUrl, jellyfinUsername, jellyfinPassword, options } = req.body

  if (!plexUrl || !plexToken || !jellyfinUrl) {
    res.status(400).json({ error: 'plexUrl, plexToken, jellyfinUrl required' })
    return
  }

  let jellyfinUserId = req.body.jellyfinUserId
  let jellyfinToken = req.body.jellyfinToken

  if (!jellyfinToken && jellyfinUsername) {
    try {
      const auth = await JellyfinClient.authenticate(jellyfinUrl, jellyfinUsername, jellyfinPassword || '')
      jellyfinToken = auth.token
      jellyfinUserId = auth.userId
    } catch (err: any) {
      res.status(401).json({ error: `Jellyfin auth failed: ${err.message}` })
      return
    }
  }

  if (!jellyfinToken || !jellyfinUserId) {
    res.status(400).json({ error: 'Jellyfin credentials required (token+userId or username+password)' })
    return
  }

  const plexClient = new PlexClient(plexUrl, plexToken)
  try {
    const valid = await plexClient.validate()
    if (!valid) {
      res.status(401).json({ error: 'Plex token invalid' })
      return
    }
  } catch (err: any) {
    res.status(502).json({ error: `Cannot reach Plex: ${err.message}` })
    return
  }

  const jfClient = new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId)
  try {
    const valid = await jfClient.validate()
    if (!valid) {
      res.status(401).json({ error: 'Jellyfin token invalid' })
      return
    }
  } catch (err: any) {
    res.status(502).json({ error: `Cannot reach Jellyfin: ${err.message}` })
    return
  }

  const migration = createMigration({
    plexUrl, plexToken, jellyfinUrl, jellyfinUserId,
    options: options || {},
  })

  runMigration(migration.id, plexUrl, plexToken, jellyfinUrl, jellyfinToken, jellyfinUserId, options || {}).catch(() => {})

  res.status(201).json(migration)
})

router.get('/', (_req, res) => {
  res.json(listMigrations())
})

router.get('/:id', (req, res) => {
  const migration = getMigration(req.params.id)
  if (!migration) { res.status(404).json({ error: 'Not found' }); return }
  res.json(migration)
})

router.get('/:id/items', (req, res) => {
  const migration = getMigration(req.params.id)
  if (!migration) { res.status(404).json({ error: 'Not found' }); return }
  res.json(getMigrationItems(req.params.id))
})

router.post('/:id/cancel', (req, res) => {
  const migration = getMigration(req.params.id)
  if (!migration) { res.status(404).json({ error: 'Not found' }); return }
  const controller = activeJobs.get(req.params.id)
  if (controller) {
    controller.abort()
    updateMigrationStatus(req.params.id, 'cancelled')
    res.json({ ok: true, status: 'cancelled' })
  } else {
    res.json({ ok: true, status: migration.status })
  }
})

async function runMigration(
  migrationId: string,
  plexUrl: string,
  plexToken: string,
  jellyfinUrl: string,
  jellyfinToken: string,
  jellyfinUserId: string,
  options: Record<string, boolean>
) {
  const controller = new AbortController()
  activeJobs.set(migrationId, controller)

  try {
    updateMigrationStatus(migrationId, 'scanning')
    const plexClient = new PlexClient(plexUrl, plexToken)
    const jellyfinClient = new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId)

    const libraries = await plexClient.getLibraries()
    const allItems: PlexItem[] = []

    for (const lib of libraries) {
      if (controller.signal.aborted) break
      if (lib.type !== 'movie' && lib.type !== 'show') continue
      const items = await plexClient.getAllItemsPaginated(lib.key)
      allItems.push(...items)
    }

    updateMigrationCounts(migrationId, allItems.length, 0, 0)
    updateMigrationStatus(migrationId, 'matching')

    for (const plexItem of allItems) {
      if (controller.signal.aborted) break

      const plexKey = plexItem.ratingKey
      const guids = plexItem.Guid || []
      const providerIds = PlexClient.extractProviderIds(guids)

      insertMigrationItem({
        migration_id: migrationId,
        plex_key: plexKey,
        plex_title: plexItem.title || plexItem.grandparentTitle || 'Unknown',
        plex_year: plexItem.year || plexItem.parentYear || plexItem.grandparentYear || null,
        plex_type: plexItem.type,
        plex_provider_ids: JSON.stringify(providerIds),
        jellyfin_id: null,
        match_method: null,
        match_confidence: 0,
        status: 'pending',
        error: null,
      })
    }

    updateMigrationStatus(migrationId, 'migrating')

    const items = getMigrationItems(migrationId)
    let migrated = 0
    let failed = 0

    for (const item of items) {
      if (controller.signal.aborted) break

      try {
        const plexItem: PlexItem = {
          ratingKey: item.plex_key,
          key: `/library/metadata/${item.plex_key}`,
          title: item.plex_title,
          type: item.plex_type,
          year: item.plex_year,
          Guid: item.plex_provider_ids ? JSON.parse(item.plex_provider_ids) : [],
          viewCount: 0,
          viewOffset: 0,
        }

        const match = await matchItem(plexItem, plexClient, jellyfinClient)

        if (match.jellyfinItem) {
          updateMigrationItem(item.id, {
            jellyfin_id: match.jellyfinItem.Id,
            match_method: match.method,
            match_confidence: match.confidence,
            status: 'matched',
          })

          if (options.watchHistory !== false) {
            await migrateWatchStatus(jellyfinClient, match.jellyfinItem.Id, plexItem)
          }

          if (options.ratings !== false) {
            await migrateRating(jellyfinClient, match.jellyfinItem.Id, plexItem)
          }

          migrated++
        } else {
          updateMigrationItem(item.id, {
            match_method: 'none',
            match_confidence: 0,
            status: 'no_match',
          })
          failed++
        }
      } catch (err: any) {
        updateMigrationItem(item.id, {
          status: 'error',
          error: err.message?.slice(0, 200),
        })
        failed++
      }

      updateMigrationCounts(migrationId, items.length, migrated, failed)
    }

    updateMigrationStatus(migrationId, controller.signal.aborted ? 'cancelled' : 'completed')
  } catch (err: any) {
    updateMigrationStatus(migrationId, 'error', err.message?.slice(0, 500))
  } finally {
    activeJobs.delete(migrationId)
  }
}

export default router
