import { v4 as uuid } from 'uuid'
import crypto from 'crypto'
import db from './db.js'

export function createMigration(opts: {
  plexUrl: string
  plexToken: string
  jellyfinUrl: string
  jellyfinUserId: string
  options?: Record<string, boolean>
}) {
  const id = uuid()
  const tokenHash = crypto.createHash('sha256').update(opts.plexToken).digest('hex').slice(0, 32)
  db.prepare(`
    INSERT INTO migrations (id, plex_url, plex_token_hash, jellyfin_url, jellyfin_user_id, options, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, opts.plexUrl, tokenHash, opts.jellyfinUrl, opts.jellyfinUserId, JSON.stringify(opts.options || {}))
  return getMigration(id)
}

export function getMigration(id: string) {
  return db.prepare('SELECT * FROM migrations WHERE id = ?').get(id) as MigrationRow | undefined
}

export function listMigrations(limit = 50) {
  return db.prepare('SELECT * FROM migrations ORDER BY created_at DESC LIMIT ?').all(limit) as MigrationRow[]
}

export function updateMigrationStatus(id: string, status: string, error?: string) {
  db.prepare(`
    UPDATE migrations SET status = ?, error = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, error || null, id)
}

export function updateMigrationCounts(id: string, total: number, migrated: number, failed: number) {
  db.prepare(`
    UPDATE migrations SET total_items = ?, migrated_items = ?, failed_items = ?, updated_at = datetime('now') WHERE id = ?
  `).run(total, migrated, failed, id)
}

export function insertMigrationItem(item: Omit<MigrationItemRow, 'id' | 'created_at'>) {
  db.prepare(`
    INSERT OR IGNORE INTO migration_items (migration_id, plex_key, plex_title, plex_year, plex_type, plex_provider_ids, jellyfin_id, match_method, match_confidence, status, error)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.migration_id, item.plex_key, item.plex_title, item.plex_year, item.plex_type,
    item.plex_provider_ids, item.jellyfin_id, item.match_method, item.match_confidence,
    item.status, item.error || null
  )
}

export function getMigrationItems(migrationId: string) {
  return db.prepare('SELECT * FROM migration_items WHERE migration_id = ? ORDER BY id').all(migrationId) as MigrationItemRow[]
}

export function updateMigrationItem(id: number, updates: { jellyfin_id?: string; match_method?: string; match_confidence?: number; status: string; error?: string }) {
  const sets: string[] = []
  const vals: any[] = []
  if (updates.jellyfin_id !== undefined) { sets.push('jellyfin_id = ?'); vals.push(updates.jellyfin_id) }
  if (updates.match_method !== undefined) { sets.push('match_method = ?'); vals.push(updates.match_method) }
  if (updates.match_confidence !== undefined) { sets.push('match_confidence = ?'); vals.push(updates.match_confidence) }
  sets.push('status = ?'); vals.push(updates.status)
  if (updates.error !== undefined) { sets.push('error = ?'); vals.push(updates.error) }
  vals.push(id)
  db.prepare(`UPDATE migration_items SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}

export function addWaitlist(email: string, source = 'landing') {
  try {
    db.prepare('INSERT INTO waitlist (email, source) VALUES (?, ?)').run(email, source)
    return true
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return false
    throw err
  }
}

export function getWaitlistCount() {
  const row = db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as { count: number }
  return row.count
}

export interface MigrationRow {
  id: string
  plex_url: string
  plex_token_hash: string
  jellyfin_url: string
  jellyfin_user_id: string
  status: string
  total_items: number
  migrated_items: number
  failed_items: number
  options: string
  error: string | null
  created_at: string
  updated_at: string
}

export interface MigrationItemRow {
  id: number
  migration_id: string
  plex_key: string
  plex_title: string
  plex_year: number | null
  plex_type: string
  plex_provider_ids: string | null
  jellyfin_id: string | null
  match_method: string | null
  match_confidence: number
  status: string
  error: string | null
  created_at: string
}

export interface CloudServerRow {
  id: string
  email: string
  tier: string
  status: string
  jellyfin_url: string | null
  admin_token: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  port: number | null
  storage_gb: number
  custom_domain: string | null
  created_at: string
  updated_at: string
}

export function createCloudServer(opts: { email: string; tier: string; stripeCustomerId?: string; stripeSubscriptionId?: string }) {
  const id = uuid()
  db.prepare(`
    INSERT INTO cloud_servers (id, email, tier, status, stripe_customer_id, stripe_subscription_id, storage_gb)
    VALUES (?, ?, ?, 'pending', ?, ?, ?)
  `).run(id, opts.email.toLowerCase().trim(), opts.tier, opts.stripeCustomerId || null, opts.stripeSubscriptionId || null, opts.tier === 'cloud_plus' ? 50 : 0)
  return getCloudServer(id)
}

export function getCloudServer(id: string) {
  return db.prepare('SELECT * FROM cloud_servers WHERE id = ?').get(id) as CloudServerRow | undefined
}

export function getCloudServerByEmail(email: string) {
  return db.prepare('SELECT * FROM cloud_servers WHERE email = ? ORDER BY created_at DESC').all(email.toLowerCase().trim()) as CloudServerRow[]
}

export function updateCloudServerStatus(id: string, status: string, updates?: Partial<{ jellyfin_url: string; admin_token: string; port: number; custom_domain: string }>) {
  const sets = ['status = ?', 'updated_at = datetime(\'now\')']
  const vals: any[] = [status]
  if (updates?.jellyfin_url) { sets.push('jellyfin_url = ?'); vals.push(updates.jellyfin_url) }
  if (updates?.admin_token) { sets.push('admin_token = ?'); vals.push(updates.admin_token) }
  if (updates?.port) { sets.push('port = ?'); vals.push(updates.port) }
  if (updates?.custom_domain) { sets.push('custom_domain = ?'); vals.push(updates.custom_domain) }
  vals.push(id)
  db.prepare(`UPDATE cloud_servers SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
}
