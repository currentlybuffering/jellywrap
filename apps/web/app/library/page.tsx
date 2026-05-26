'use client'

import { useState } from 'react'
import type { DuplicateGroup, SubtitleResult, GapResult } from '../smart-library-types'

type Tab = 'duplicates' | 'subtitles' | 'gaps'
type AuthStep = 'auth' | 'tools'

export default function SmartLibraryPage() {
  const [step, setStep] = useState<AuthStep>('auth')
  const [tab, setTab] = useState<Tab>('duplicates')
  const [serverUrl, setServerUrl] = useState('')
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [subtitles, setSubtitles] = useState<SubtitleResult[]>([])
  const [subtitleItem, setSubtitleItem] = useState('')
  const [gaps, setGaps] = useState<GapResult[]>([])

  const authHeaders = () => ({
    'Content-Type': 'application/json',
  })

  const handleLogin = async () => {
    setError('')
    if (!serverUrl || !username) { setError('Server URL and username required'); return }
    try {
      const res = await fetch('/api/jellyfin-auth', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ serverUrl, username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Auth failed'); return }
      setToken(data.token)
      setUserId(data.userId)
      setStep('tools')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const runDuplicates = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/library/duplicates', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ jellyfinUrl: serverUrl, jellyfinToken: token, jellyfinUserId: userId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDuplicates(data.duplicates || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runSubtitles = async () => {
    if (!subtitleItem.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/library/subtitles/${subtitleItem.trim()}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ jellyfinUrl: serverUrl, jellyfinToken: token, jellyfinUserId: userId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSubtitles(data.subtitles || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runGaps = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/library/gaps', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ jellyfinUrl: serverUrl, jellyfinToken: token, jellyfinUserId: userId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setGaps(data.gaps || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-vault-950">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <a href="/" className="text-sm text-zinc-500 hover:text-gold transition-colors mb-8 inline-block">
          &larr; Back to home
        </a>

        <h1 className="font-display text-4xl font-black mb-2">
          Smart <span className="text-gold">Library</span>
        </h1>
        <p className="text-zinc-500 mb-10">
          Duplicate detection, gap finding, and subtitle hunting. Tools Plex doesn&apos;t have.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {step === 'auth' && (
          <div className="card max-w-md">
            <h2 className="font-semibold mb-4">Connect to Jellyfin</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Server URL</label>
                <input type="url" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} placeholder="http://192.168.1.100:8096" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field" />
              </div>
              <button onClick={handleLogin} disabled={!serverUrl || !username} className="btn-gold w-full">
                Connect
              </button>
            </div>
          </div>
        )}

        {step === 'tools' && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-vault-700 pb-px">
              {(['duplicates', 'subtitles', 'gaps'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                    tab === t
                      ? 'border-gold text-gold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t === 'duplicates' ? 'Duplicate Detection' : t === 'subtitles' ? 'Subtitle Hunt' : 'Gap Finder'}
                </button>
              ))}
            </div>

            {tab === 'duplicates' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">Duplicate Detection</h2>
                    <p className="text-sm text-zinc-500">Find and remove duplicate entries in your library.</p>
                  </div>
                  <button onClick={runDuplicates} disabled={loading} className="btn-gold">
                    {loading ? 'Scanning...' : 'Scan Library'}
                  </button>
                </div>
                {duplicates.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-400 mb-2">
                      Found <span className="text-gold font-semibold">{duplicates.length}</span> duplicate groups ({duplicates.reduce((s, g) => s + g.suggestedRemove.length, 0)} items to remove)
                    </div>
                    {duplicates.map((group) => (
                      <div key={group.key} className="card-glow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-semibold">{group.title}</span>
                            {group.year ? <span className="text-zinc-500 ml-2">({group.year})</span> : null}
                            {group.providerId && <span className="text-xs text-zinc-600 ml-2 font-mono">{group.providerId}</span>}
                          </div>
                          <span className="text-xs text-red-400 font-mono">{group.items.length} copies</span>
                        </div>
                        <div className="space-y-2">
                          {group.items.map((item, i) => (
                            <div key={item.Id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-vault-900/50">
                              <div className="flex items-center gap-2">
                                {i === 0 ? (
                                  <span className="text-green-400 text-xs">KEEP</span>
                                ) : (
                                  <span className="text-red-400 text-xs">REMOVE</span>
                                )}
                                <span className="text-zinc-300">{item.Name}</span>
                                <span className="text-zinc-600 text-xs font-mono">{item.Id.slice(0, 8)}</span>
                              </div>
                              {(item as any).Path && (
                                <span className="text-zinc-600 text-xs truncate max-w-xs">{(item as any).Path}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loading && (
                  <div className="text-center text-zinc-600 py-16">Click &quot;Scan Library&quot; to find duplicates</div>
                )}
              </div>
            )}

            {tab === 'subtitles' && (
              <div>
                <div className="mb-6">
                  <h2 className="font-semibold text-lg">Subtitle Hunt</h2>
                  <p className="text-sm text-zinc-500 mb-4">Search free subtitle databases for any item in your library.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={subtitleItem}
                      onChange={(e) => setSubtitleItem(e.target.value)}
                      placeholder="Enter Jellyfin item ID"
                      className="input-field flex-1"
                    />
                    <button onClick={runSubtitles} disabled={loading || !subtitleItem.trim()} className="btn-gold whitespace-nowrap">
                      {loading ? 'Searching...' : 'Find Subtitles'}
                    </button>
                  </div>
                </div>
                {subtitles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-zinc-400 mb-2">
                      Found <span className="text-gold font-semibold">{subtitles.length}</span> subtitles
                    </div>
                    {subtitles.map((sub, i) => (
                      <div key={i} className="card-glow flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{sub.fileName}</div>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-zinc-500">{sub.language}</span>
                            <span className="text-xs text-zinc-600">{sub.source}</span>
                            {sub.score > 0 && <span className="text-xs text-gold">Score: {sub.score.toFixed(1)}</span>}
                          </div>
                        </div>
                        {sub.downloadUrl && (
                          <a href={sub.downloadUrl} target="_blank" rel="noopener" className="btn-outline text-xs px-3 py-1.5">
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : !loading && (
                  <div className="text-center text-zinc-600 py-16">Enter an item ID and click &quot;Find Subtitles&quot;</div>
                )}
              </div>
            )}

            {tab === 'gaps' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-lg">Gap Finder</h2>
                    <p className="text-sm text-zinc-500">Find missing seasons and episodes in your TV collection.</p>
                  </div>
                  <button onClick={runGaps} disabled={loading} className="btn-gold">
                    {loading ? 'Scanning...' : 'Scan TV Library'}
                  </button>
                </div>
                {gaps.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-400 mb-2">
                      Found <span className="text-gold font-semibold">{gaps.length}</span> series with gaps ({gaps.reduce((s, g) => s + g.totalMissing, 0)} missing items)
                    </div>
                    {gaps.map((gap) => (
                      <div key={gap.seriesId} className="card-glow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-semibold">{gap.seriesName}</span>
                            {gap.seriesYear ? <span className="text-zinc-500 ml-2">({gap.seriesYear})</span> : null}
                          </div>
                          <span className="text-xs text-red-400 font-mono">{gap.totalMissing} missing</span>
                        </div>
                        {gap.missingSeasons.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">Missing Seasons: </span>
                            <span className="text-sm text-red-400">{gap.missingSeasons.join(', ')}</span>
                          </div>
                        )}
                        {gap.missingEpisodes.length > 0 && (
                          <div>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">Missing Episodes: </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {gap.missingEpisodes.slice(0, 30).map((ep) => (
                                <span key={`${ep.season}-${ep.episode}`} className="px-2 py-0.5 bg-vault-900 rounded text-xs text-zinc-400 font-mono">
                                  {ep.title}
                                </span>
                              ))}
                              {gap.missingEpisodes.length > 30 && (
                                <span className="text-xs text-zinc-600">+{gap.missingEpisodes.length - 30} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : !loading && (
                  <div className="text-center text-zinc-600 py-16">Click &quot;Scan TV Library&quot; to find gaps</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
