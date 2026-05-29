import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), 'data')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'migration.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    plex_url TEXT NOT NULL,
    plex_token_hash TEXT NOT NULL,
    jellyfin_url TEXT NOT NULL,
    jellyfin_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_items INTEGER DEFAULT 0,
    migrated_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    options TEXT DEFAULT '{}',
    error TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS migration_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_id TEXT NOT NULL REFERENCES migrations(id),
    plex_key TEXT NOT NULL,
    plex_title TEXT,
    plex_year INTEGER,
    plex_type TEXT,
    plex_provider_ids TEXT,
    jellyfin_id TEXT,
    match_method TEXT,
    match_confidence REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(migration_id, plex_key)
  );

  CREATE INDEX IF NOT EXISTS idx_migration_items_mid ON migration_items(migration_id);
  CREATE INDEX IF NOT EXISTS idx_migration_items_status ON migration_items(migration_id, status);

  CREATE TABLE IF NOT EXISTS cloud_servers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    tier TEXT NOT NULL CHECK(tier IN ('cloud', 'cloud_plus')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'provisioning', 'active', 'suspended', 'terminated')),
    jellyfin_url TEXT,
    admin_token TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    port INTEGER,
    storage_gb INTEGER DEFAULT 50,
    custom_domain TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_cloud_servers_email ON cloud_servers(email);
  CREATE INDEX IF NOT EXISTS idx_cloud_servers_status ON cloud_servers(status);
  `)

export default db as Database.Database
