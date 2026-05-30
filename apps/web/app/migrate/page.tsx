'use client'

import { useState, useEffect, useCallback } from 'react'
import { useVault } from '@/lib/store'
import { AlertCircle } from 'lucide-react'

type Step = 'connect' | 'options' | 'running' | 'done'
type MigrationStatus = 'pending' | 'scanning' | 'matching' | 'migrating' | 'completed' | 'error' | 'cancelled'

interface MigrationData {
  id: string
  status: MigrationStatus
  total_items: number
  migrated_items: number
  failed_items: number
  error: string | null
}

interface MigrationItem {
  id: number
  plex_title: string
  plex_type: string
  plex_year: number | null
  jellyfin_id: string | null
  match_method: string | null
  match_confidence: number
  status: string
  error: string | null
}

export default function MigratePage() {
  const { connected, jellyfinUrl: storedUrl, jellyfinToken: storedToken, jellyfinUserId: storedUserId, setPlexAuth, plexUrl: storedPlexUrl, plexToken: storedPlexToken } = useVault()
  const isDemo = storedUrl?.includes('demo.jellyfin.org')
  const [step, setStep] = useState<Step>('connect')
  const [plexUrl, setPlexUrl] = useState(storedPlexUrl || '')
  const [plexToken, setPlexToken] = useState(storedPlexToken || '')
  const [jellyfinUsername, setJellyfinUsername] = useState('')
  const [jellyfinPassword, setJellyfinPassword] = useState('')
  const [options, setOptions] = useState({ watchHistory: true, ratings: true })
  const [migration, setMigration] = useState<MigrationData | null>(null)
  const [items, setItems] = useState<MigrationItem[]>([])
  const [error, setError] = useState('')
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null)

  const jellyfinUrl = storedUrl
  const jellyfinToken = storedToken
  const jellyfinUserId = storedUserId

  const pollMigration = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/migrations/${id}`)
      const data = await res.json()
      setMigration(data)
      if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
        setStep('done')
        if (pollTimer) clearInterval(pollTimer)
        const itemsRes = await fetch(`/api/migrations/${id}/items`)
        setItems(await itemsRes.json())
      }
    } catch {
      // retry on next poll
    }
  }, [pollTimer])

  useEffect(() => {
    return () => { if (pollTimer) clearInterval(pollTimer) }
  }, [pollTimer])

  const startMigration = async () => {
    setError('')
    try {
      setPlexAuth(plexUrl, plexToken)
      const res = await fetch('/api/migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plexUrl, plexToken,
          jellyfinUrl,
          jellyfinUsername,
          jellyfinPassword,
          options,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Migration failed to start'); return }
      setMigration(data)
      setStep('running')
      const timer = setInterval(() => pollMigration(data.id), 2000)
      setPollTimer(timer)
    } catch (err: any) { setError(err.message) }
  }

  const cancelMigration = async () => {
    if (!migration) return
    await fetch(`/api/migrations/${migration.id}/cancel`, { method: 'POST' })
    if (pollTimer) clearInterval(pollTimer)
  }

  const statusLabel: Record<MigrationStatus, string> = {
    pending: 'Starting...',
    scanning: 'Scanning Plex libraries...',
    matching: 'Matching items to Jellyfin...',
    migrating: 'Migrating watch history & ratings...',
    completed: 'Done!',
    error: 'Error',
    cancelled: 'Cancelled',
  }

  const progress = migration
    ? migration.total_items > 0
      ? Math.round(((migration.migrated_items + migration.failed_items) / migration.total_items) * 100)
      : 0
    : 0

  const methodLabel: Record<string, string> = {
    provider_id: 'Provider ID',
    title_year: 'Title + Year',
    title_fuzzy: 'Title (fuzzy)',
    none: 'No match',
  }

  const plexReady = plexUrl && plexToken
  const jellyfinReady = connected && jellyfinUrl && jellyfinToken && jellyfinUserId
  const needJellyfinCreds = connected && jellyfinToken ? false : (jellyfinUrl && jellyfinUsername)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
    <h1 className="font-display text-2xl sm:text-3xl font-black mb-1">
      Plex → JellyWrap <span className="text-gold">Migration</span>
    </h1>
    <p className="text-sm text-zinc-500 mb-2">
      Transfer your watch history, ratings, and favorites from Plex to Jellyfin. One click.
    </p>
    <p className="text-xs text-zinc-600 mb-6">
      This migrates your <span className="text-zinc-400">metadata</span> (watch history, ratings, favorites) — your actual media files stay on your server and are already accessible by Jellyfin.
    </p>

    {isDemo && (
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-6">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <span className="text-amber-300 font-medium">Demo mode</span>
          <span className="text-zinc-400"> — Migration requires your own Jellyfin server with admin access. The demo server is read-only and doesn't support writing watch history or ratings.</span>
        </div>
      </div>
    )}

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">{error}</div>}

        {step === 'connect' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-gold/10 text-gold text-xs flex items-center justify-center font-mono">1</span>
                Connect Plex
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Plex URL</label>
                  <input type="url" value={plexUrl} onChange={(e) => setPlexUrl(e.target.value)} placeholder="https://192.168.1.100:32400" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Plex Token</label>
                  <input type="password" value={plexToken} onChange={(e) => setPlexToken(e.target.value)} placeholder="e.g. a1b2c3d4e5f6" className="input-field" />
                  <p className="text-xs text-zinc-600 mt-1">
                    We never store your Plex token. It&apos;s hashed and discarded after migration.{' '}
                    <a href="https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/" target="_blank" rel="noopener" className="text-gold/70 underline underline-offset-2 hover:text-gold transition-colors">
                      How to find your token
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-gold/10 text-gold text-xs flex items-center justify-center font-mono">2</span>
                Connect Jellyfin / JellyWrap
              </h2>
              {connected ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-green-400">Connected to {jellyfinUrl.replace(/^https?:\/\//, '')}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Jellyfin URL</label>
                    <input type="url" value={jellyfinUrl} onChange={() => {}} placeholder="http://192.168.1.100:8096" className="input-field opacity-60" readOnly />
                    <p className="text-xs text-zinc-600 mt-1">Connect via any page first, or enter credentials below.</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Username</label>
                    <input type="text" value={jellyfinUsername} onChange={(e) => setJellyfinUsername(e.target.value)} placeholder="admin" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Password</label>
                    <input type="password" value={jellyfinPassword} onChange={(e) => setJellyfinPassword(e.target.value)} placeholder="••••••••" className="input-field" />
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-gold/10 text-gold text-xs flex items-center justify-center font-mono">3</span>
                What to migrate
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={options.watchHistory} onChange={(e) => setOptions((o) => ({ ...o, watchHistory: e.target.checked }))} className="w-4 h-4 accent-gold" />
                  <span className="text-sm">Watch history & progress</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={options.ratings} onChange={(e) => setOptions((o) => ({ ...o, ratings: e.target.checked }))} className="w-4 h-4 accent-gold" />
                  <span className="text-sm">Ratings & favorites</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => { if (plexReady && (jellyfinReady || needJellyfinCreds)) { setStep('options') } }}
              disabled={!plexReady || (!jellyfinReady && !needJellyfinCreds)}
              className="btn-gold w-full"
            >
              Review & Start Migration
            </button>
          </div>
        )}

        {step === 'options' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-semibold mb-4">Ready to migrate</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-vault-600">
                  <span className="text-zinc-500">Plex Server</span>
                  <span className="font-mono">{plexUrl}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-vault-600">
                  <span className="text-zinc-500">Jellyfin Server</span>
                  <span className="font-mono">{jellyfinUrl}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-vault-600">
                  <span className="text-zinc-500">Watch History</span>
                  <span>{options.watchHistory ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-500">Ratings</span>
                  <span>{options.ratings ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep('connect')} className="btn-outline flex-1">Back</button>
              <button onClick={startMigration} className="btn-gold flex-1">Start Migration</button>
            </div>
          </div>
        )}

        {step === 'running' && migration && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{statusLabel[migration.status as MigrationStatus] || migration.status}</h2>
                <button onClick={cancelMigration} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
              </div>
              <div className="w-full bg-vault-700 rounded-full h-3 mb-4">
                <div className="bg-gold h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-2xl font-mono font-bold">{migration.migrated_items}</div>
                  <div className="text-zinc-500 text-xs">Migrated</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold text-red-400">{migration.failed_items}</div>
                  <div className="text-zinc-500 text-xs">No Match</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold text-zinc-500">{migration.total_items}</div>
                  <div className="text-zinc-500 text-xs">Total</div>
    </div>
      </div>
      </div>
    </div>
    )}

    {step === 'done' && migration && (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-semibold mb-4">
          {migration.status === 'completed' ? (
            <span className="text-gold">Migration Complete</span>
          ) : (
            <span className="text-red-400">Migration {migration.status}</span>
          )}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-6">
          <div>
            <div className="text-2xl font-mono font-bold text-gold">{migration.migrated_items}</div>
            <div className="text-zinc-500 text-xs">Migrated</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-red-400">{migration.failed_items}</div>
            <div className="text-zinc-500 text-xs">No Match</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-zinc-500">{migration.total_items}</div>
            <div className="text-zinc-500 text-xs">Total</div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-vault-600 text-zinc-500">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Match</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 200).map((item) => (
                  <tr key={item.id} className="border-b border-vault-700/30">
                    <td className="py-2 pr-4 text-zinc-300">
                      {item.plex_title}
                      {item.plex_year ? <span className="text-zinc-600 ml-1">({item.plex_year})</span> : null}
                    </td>
                    <td className="py-2 text-zinc-500 capitalize">{item.plex_type}</td>
                    <td className="py-2">
                      {item.match_method ? (
                        <span className="text-zinc-400">{methodLabel[item.match_method] || item.match_method}</span>
                      ) : '—'}
                    </td>
                    <td className="py-2">
                      {item.status === 'matched' ? (
                        <span className="text-green-400">Matched</span>
                      ) : item.status === 'no_match' ? (
                        <span className="text-yellow-500">No match</span>
                      ) : item.status === 'error' ? (
                        <span className="text-red-400" title={item.error || ''}>Error</span>
                      ) : (
                        <span className="text-zinc-600">{item.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length > 200 && (
              <p className="text-xs text-zinc-600 text-center py-3">Showing 200 of {items.length} items</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <a href="/" className="btn-outline flex-1 text-center">Back to Home</a>
        <button onClick={() => {
          setStep('connect')
          setMigration(null)
          setItems([])
        }} className="btn-gold flex-1">New Migration</button>
      </div>
    </div>
    )}
  </div>
  )
}
