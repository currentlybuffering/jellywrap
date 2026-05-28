'use client'

import { useState } from 'react'
import { useVault } from '@/lib/store'
import { JellyfinClient } from '@/lib/jellyfin'

export default function JellyfinAuthForm({ onConnected, defaultServerUrl, defaultUsername }: { onConnected?: () => void; defaultServerUrl?: string; defaultUsername?: string }) {
  const { setJellyfinAuth, setConnected, connected, jellyfinUrl: storedUrl, jellyfinToken, jellyfinUserId } = useVault()
  const [serverUrl, setServerUrl] = useState(storedUrl || defaultServerUrl || '')
  const [username, setUsername] = useState(defaultUsername || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (connected && jellyfinToken && jellyfinUserId) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-green-400">Connected to {storedUrl.replace(/^https?:\/\//, '')}</span>
        {onConnected ? (
          <button onClick={onConnected} className="btn-gold text-xs ml-auto px-4 py-1.5">
            Continue
          </button>
        ) : (
          <span className="text-xs text-zinc-500 ml-auto">You&apos;re all set — use the tabs above</span>
        )}
      </div>
    )
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      let deviceId = ''
      if (typeof window !== 'undefined') {
        deviceId = localStorage.getItem('jw-device-id') || ''
        if (!deviceId) {
          deviceId = 'jw-' + crypto.randomUUID()
          localStorage.setItem('jw-device-id', deviceId)
        }
      }
      const res = await fetch('/api/jellyfin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverUrl, username, password, deviceId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Connection failed'); return }
      setJellyfinAuth(data.serverUrl || serverUrl, data.token, data.userId)
      onConnected?.()
    } catch {
      setError('Can\'t reach the server. Check that the URL is correct and the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-md">
      <h2 className="font-semibold text-lg mb-1">Connect to Jellyfin</h2>
      <p className="text-sm text-zinc-500 mb-5">Enter your server details. This saves so you only do it once.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Server URL</label>
          <input
            type="url"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://192.168.1.100:8096"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank if none"
            className="input-field"
          />
        </div>
        <button onClick={handleLogin} disabled={loading || !serverUrl || !username} className="btn-gold w-full">
          {loading ? 'Connecting...' : 'Connect'}
        </button>
        <p className="text-xs text-zinc-600 text-center">
          Don&apos;t have Jellyfin?{' '}
          <a href="/getting-started" className="text-gold hover:underline">Set it up in 2 minutes</a>
        </p>
      </div>
    </div>
  )
}
