'use client'

import { useState } from 'react'
import { useVault } from '@/lib/store'
import ItemPicker from '@/components/item-picker'
import { AlertCircle } from 'lucide-react'
import type { DuplicateGroup, SubtitleResult, GapResult } from '../smart-library-types'

type Tab = 'duplicates' | 'subtitles' | 'gaps'

export default function SmartLibraryPage() {
  const { connected, jellyfinUrl, jellyfinToken, jellyfinUserId } = useVault()
  const isDemo = jellyfinUrl?.includes('demo.jellyfin.org')
  const [tab, setTab] = useState<Tab>('duplicates')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [subtitleItemId, setSubtitleItemId] = useState('')
  const [subtitleItemName, setSubtitleItemName] = useState('')
  const [subtitles, setSubtitles] = useState<SubtitleResult[]>([])
  const [gaps, setGaps] = useState<GapResult[]>([])
  const [gapsSearched, setGapsSearched] = useState(false)
  const [subtitlesSearched, setSubtitlesSearched] = useState(false)
  const [subtitlesWarning, setSubtitlesWarning] = useState('')
  const [gapsWarning, setGapsWarning] = useState('')

  const authBody = () => ({ jellyfinUrl, jellyfinToken, jellyfinUserId })

  const runDuplicates = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/library/duplicates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody()) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDuplicates(data.duplicates || [])
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const runSubtitles = async () => {
    if (!subtitleItemId) return
    setLoading(true); setError(''); setSubtitlesSearched(true); setSubtitlesWarning('')
    try {
      const res = await fetch(`/api/library/subtitles/${subtitleItemId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody()) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSubtitles(data.subtitles || [])
      if (data.warning) setSubtitlesWarning(data.warning)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const runGaps = async () => {
    setLoading(true); setError(''); setGapsSearched(true); setGapsWarning('')
    try {
      const res = await fetch('/api/library/gaps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody()) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setGaps(data.gaps || [])
      if (data.warning) setGapsWarning(data.warning)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
    <h1 className="font-display text-2xl sm:text-3xl font-black mb-1">Smart <span className="text-gold">Library</span></h1>
    <p className="text-sm text-zinc-500 mb-6">Duplicate detection, gap finding, and subtitle hunting. Tools Plex doesn&apos;t have.</p>

    {isDemo && (
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-amber-400 text-sm mb-6 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <span className="font-medium">Demo mode.</span>{' '}
          Duplicate detection works on the demo server. Gap Finder and Subtitle Hunt need your own Jellyfin server with a TMDB API key configured.
        </div>
      </div>
    )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">{error}</div>}

      <div className="space-y-6">
        <div className="flex gap-1 border-b border-vault-700/50 pb-px -mb-px">
        {(['duplicates', 'subtitles', 'gaps'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${tab === t ? 'border-gold text-gold' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t === 'duplicates' ? 'Duplicates' : t === 'subtitles' ? 'Subtitles' : 'Gap Finder'}
          </button>
              ))}
            </div>

            {tab === 'duplicates' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div><h2 className="font-semibold text-lg">Duplicate Detection</h2><p className="text-sm text-zinc-500">Find and remove duplicate entries in your library.</p></div>
                  <button onClick={runDuplicates} disabled={loading} className="btn-gold">{loading ? 'Scanning...' : 'Scan Library'}</button>
                </div>
                {duplicates.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-400 mb-2">Found <span className="text-gold font-semibold">{duplicates.length}</span> duplicate groups ({duplicates.reduce((s, g) => s + g.suggestedRemove.length, 0)} items to remove)</div>
                    {duplicates.map((group) => (
                      <div key={group.key} className="card-glow">
                        <div className="flex items-center justify-between mb-3">
                          <div><span className="font-semibold">{group.title}</span>{group.year ? <span className="text-zinc-500 ml-2">({group.year})</span> : null}</div>
                          <span className="text-xs text-red-400 font-mono">{group.items.length} copies</span>
                        </div>
                        <div className="space-y-2">
                          {group.items.map((item, i) => (
                            <div key={item.Id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-vault-900/50">
                            <div className="flex items-center gap-2">
                                {i === 0 ? <span className="text-green-400 text-xs">KEEP</span> : <span className="text-red-400 text-xs">REMOVE</span>}
                                <span className="text-zinc-300">{item.Name}</span>
                            </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loading && <div className="text-center text-zinc-600 py-16">Click &quot;Scan Library&quot; to find duplicates</div>}
              </div>
            )}

            {tab === 'subtitles' && (
              <div>
                <div className="mb-6">
                  <h2 className="font-semibold text-lg">Subtitle Hunt</h2>
                  <p className="text-sm text-zinc-500 mb-4">Search free subtitle databases for any item in your library.</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <ItemPicker value={subtitleItemId} onChange={(id, name) => { setSubtitleItemId(id); setSubtitleItemName(name) }} placeholder="Search for a movie or show..." />
                    </div>
                    <button onClick={runSubtitles} disabled={loading || !subtitleItemId} className="btn-gold whitespace-nowrap">{loading ? 'Searching...' : 'Find Subtitles'}</button>
                  </div>
                  {subtitleItemName && <p className="text-xs text-zinc-500 mt-2">Searching for: <span className="text-gold">{subtitleItemName}</span></p>}
                </div>
                {subtitles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-zinc-400 mb-2">Found <span className="text-gold font-semibold">{subtitles.length}</span> subtitles for {subtitleItemName}</div>
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
                        {sub.downloadUrl && <a href={sub.downloadUrl} target="_blank" rel="noopener" className="btn-outline text-xs px-3 py-1.5">Download</a>}
                      </div>
                    ))}
                  </div>
                ) : !loading && subtitlesSearched && subtitleItemId ? (
  <div className="text-center py-16">
    <div className="text-zinc-500 mb-2">No subtitles found</div>
    {subtitlesWarning ? <div className="text-xs text-amber-500">{subtitlesWarning}</div> : <div className="text-xs text-zinc-600">Try a different item or check your server config.</div>}
  </div>
) : !loading && <div className="text-center text-zinc-600 py-16">Select an item and click &quot;Find Subtitles&quot;</div>}
              </div>
            )}

            {tab === 'gaps' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div><h2 className="font-semibold text-lg">Gap Finder</h2><p className="text-sm text-zinc-500">Find missing seasons and episodes in your TV collection.</p></div>
                  <button onClick={runGaps} disabled={loading} className="btn-gold">{loading ? 'Scanning...' : 'Scan TV Library'}</button>
                </div>
                {gaps.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-400 mb-2">Found <span className="text-gold font-semibold">{gaps.length}</span> series with gaps ({gaps.reduce((s, g) => s + g.totalMissing, 0)} missing items)</div>
                    {gaps.map((gap) => (
                      <div key={gap.seriesId} className="card-glow">
                        <div className="flex items-center justify-between mb-3">
                          <div><span className="font-semibold">{gap.seriesName}</span>{gap.seriesYear ? <span className="text-zinc-500 ml-2">({gap.seriesYear})</span> : null}</div>
                          <span className="text-xs text-red-400 font-mono">{gap.totalMissing} missing</span>
                        </div>
                        {gap.missingSeasons.length > 0 && <div className="mb-2"><span className="text-xs text-zinc-500 uppercase tracking-widest">Missing Seasons: </span><span className="text-sm text-red-400">{gap.missingSeasons.join(', ')}</span></div>}
                        {gap.missingEpisodes.length > 0 && (
                          <div>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">Missing Episodes: </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {gap.missingEpisodes.slice(0, 30).map((ep) => <span key={`${ep.season}-${ep.episode}`} className="px-2 py-0.5 bg-vault-900 rounded text-xs text-zinc-400 font-mono">{ep.title}</span>)}
                              {gap.missingEpisodes.length > 30 && <span className="text-xs text-zinc-600">+{gap.missingEpisodes.length - 30} more</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : !loading && gapsSearched ? (
  <div className="text-center py-16">
    <div className="text-zinc-500 mb-2">No gaps found — your TV library is complete!</div>
    {gapsWarning ? <div className="text-xs text-amber-500">{gapsWarning}</div> : null}
  </div>
) : !loading && <div className="text-center text-zinc-600 py-16">Click &quot;Scan TV Library&quot; to find gaps</div>}
              </div>
            )}
    </div>
  </div>
  )
}
