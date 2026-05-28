'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const inviteId = params.id as string

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<any>(null)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!inviteId) return
    fetch(`/api/invites/info?inviteId=${encodeURIComponent(inviteId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setInvite(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [inviteId])

  const handleRedeem = async () => {
    if (!username.trim()) return
    setRedeeming(true)
    setError('')
    try {
      const res = await fetch(`/api/invites/redeem/${inviteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <main className="min-h-screen bg-vault-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <a href="/" className="text-sm text-zinc-500 hover:text-gold transition-colors mb-8 inline-block">
          &larr; Back to home
        </a>

        <div className="card-glow text-center">
          {loading && (
            <div className="py-12">
              <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-500">Loading invite...</p>
            </div>
          )}

          {error && !success && (
            <div>
              <div className="text-6xl mb-4">&#x274C;</div>
              <h1 className="font-display text-2xl font-black mb-2">Invite Invalid</h1>
              <p className="text-zinc-500">{error}</p>
            </div>
          )}

          {invite && !success && (
            <div>
              <div className="text-6xl mb-4">&#x1F3A5;</div>
              <h1 className="font-display text-2xl font-black mb-2">
                Join <span className="text-gold">{invite.label || 'JellyWrap'}</span>
              </h1>
              <p className="text-zinc-500 mb-8">You&apos;ve been invited to a Jellyfin server. Create your account to get started.</p>

              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">{error}</div>}

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Pick a username" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1 block">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" className="input-field" />
                </div>
                <button onClick={handleRedeem} disabled={redeeming || !username.trim()} className="btn-gold w-full">
                  {redeeming ? 'Creating account...' : 'Join Now'}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div>
              <div className="text-6xl mb-4">&#x2705;</div>
              <h1 className="font-display text-2xl font-black mb-2">Welcome!</h1>
              <p className="text-zinc-500 mb-6">Your account has been created. You can now log in to your Jellyfin server.</p>
              {invite?.jellyfinUrl && (
                <a href={invite.jellyfinUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-block">
                  Open Jellyfin
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
