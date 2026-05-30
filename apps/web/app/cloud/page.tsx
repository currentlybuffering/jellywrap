'use client'

import { useState } from 'react'
import { useVault } from '@/lib/store'
import { Cloud, Check, Loader2, AlertCircle, Server, ExternalLink } from 'lucide-react'

type Tier = 'cloud' | 'cloud_plus'

interface CloudServer {
  id: string
  tier: Tier
  status: string
  jellyfin_url: string | null
  storage_gb: number
  custom_domain: string | null
  created_at: string
}

const tiers: { id: Tier; name: string; price: string; features: string[] }[] = [
  {
    id: 'cloud',
    name: 'Cloud',
    price: '$5/mo',
    features: [
      'Managed migration from Plex',
      'Managed WireGuard relay',
      'Auto-updates included',
      'SSL included',
      'Email support',
    ],
  },
  {
    id: 'cloud_plus',
    name: 'Cloud+',
    price: '$10/mo',
    features: [
      'Everything in Cloud',
      'Managed Jellyfin server',
      '50GB storage included',
      'Priority support',
      'Automatic backups',
      'Custom domain',
    ],
  },
]

export default function CloudPage() {
  const [selectedTier, setSelectedTier] = useState<Tier>('cloud_plus')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [server, setServer] = useState<CloudServer | null>(null)
  const [existingServers, setExistingServers] = useState<CloudServer[]>([])
  const [checkedExisting, setCheckedExisting] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')

  const checkExisting = async () => {
    if (!email) return
    try {
      const res = await fetch(`/api/cloud?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setExistingServers(data)
      }
      setCheckedExisting(true)
    } catch {}
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/cloud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier: selectedTier }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        if (data.server) {
          setServer(data.server)
        }
        return
      }

        setServer(data.server)
        setSuccessEmail(email)
      } catch {
      setError('Could not reach server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (server) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {server.status === 'active' ? 'Your server is live!' : 'Server is being provisioned...'}
          </h2>
          {server.jellyfin_url && (
            <a
              href={server.jellyfin_url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mt-2"
            >
              <ExternalLink className="w-4 h-4" />
              {server.jellyfin_url}
            </a>
          )}
          {server.status !== 'active' && (
            <p className="text-sm text-zinc-500 mt-4">
              This usually takes 1-2 minutes. Check back shortly.
            </p>
          )}
          <div className="mt-6 text-sm text-zinc-400">
            <p>We&apos;ll reach out to <span className="text-white">{successEmail}</span> with next steps.</p>
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            Server ID: {server.id} &middot; Tier: {server.tier === 'cloud_plus' ? 'Cloud+' : 'Cloud'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
    <h1 className="font-display text-2xl sm:text-3xl font-black mb-1">
      <Cloud className="w-7 h-7 inline-block text-gold mr-2 -mt-1" />
      Cloud <span className="text-gold">Hosting</span>
      <span className="ml-3 text-xs font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 align-middle">BETA</span>
    </h1>
    <p className="text-sm text-zinc-500 mb-8">
      We run a Jellyfin server for you. No Docker, no SSH, no headaches. Enter your email and we&apos;ll spin one up.
    </p>

      {existingServers.length > 0 && (
        <div className="card mb-6 border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
            <AlertCircle className="w-4 h-4" />
            You already have a server
          </div>
          {existingServers.map(s => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-vault-700/30 last:border-0">
              <div>
                <span className="text-sm text-white">{s.tier === 'cloud_plus' ? 'Cloud+' : 'Cloud'}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {s.status}
                </span>
              </div>
              {s.jellyfin_url && (
                <a href={s.jellyfin_url} target="_blank" rel="noopener" className="text-xs text-gold hover:text-gold/80">
                  Open server
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {tiers.map(tier => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`card text-left transition-all min-h-[44px] ${
              selectedTier === tier.id
                ? 'border-gold/40 shadow-[0_0_20px_rgba(232,197,71,0.1)]'
                : 'border-transparent hover:border-vault-700/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{tier.name}</h3>
              <span className="text-gold font-bold">{tier.price}</span>
            </div>
            <ul className="space-y-1.5">
              {tier.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <Check className="w-3 h-3 text-gold mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

  <form onSubmit={handleSignup} className="card max-w-md">
    <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
      <Server className="w-4 h-4 text-gold" />
      Provision your server
    </h3>
    <p className="text-xs text-zinc-500 mb-4">We&apos;ll email you when it&apos;s ready. Free during beta — no credit card.</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="cloud-email" className="text-xs text-zinc-500 mb-1 block">Email address</label>
            <input
              id="cloud-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setCheckedExisting(false) }}
              onBlur={checkExisting}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 bg-vault-800 border border-vault-700 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Provisioning...
              </>
            ) : (
              <>
                <Server className="w-4 h-4" />
                Launch {selectedTier === 'cloud_plus' ? 'Cloud+' : 'Cloud'} server
              </>
            )}
          </button>

        <p className="text-[10px] text-zinc-600 text-center">
          Free during beta. We&apos;ll contact you about billing before launch.
        </p>
        </div>
      </form>
    </div>
  )
}
