'use client'

import { useState, useEffect } from 'react'
import { useVault } from '@/lib/store'
import JellyfinAuthForm from '@/components/jellyfin-auth-form'
import { Apple, Monitor, Terminal } from 'lucide-react'

type Platform = 'mac' | 'windows' | 'linux'

const platforms: Record<Platform, {
  label: string
  icon: typeof Apple
  dockerInstall: string
  dockerStart: string
}> = {
  mac: {
    label: 'macOS',
    icon: Apple,
    dockerInstall: 'brew install --cask docker',
    dockerStart: 'open -a Docker',
  },
  windows: {
    label: 'Windows',
    icon: Monitor,
    dockerInstall: 'winget install Docker.DockerDesktop',
    dockerStart: '"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
  },
  linux: {
    label: 'Linux',
    icon: Terminal,
    dockerInstall: 'curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER',
    dockerStart: 'sudo systemctl start docker',
  },
}

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'mac'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac') || ua.includes('darwin')) return 'mac'
  return 'linux'
}

const jellyfinDocker = `docker run -d \\
  --name jellyfin \\
  -p 8096:8096 \\
  -v jellyfin-config:/config \\
  -v jellyfin-cache:/cache \\
  -v ./media:/media \\
  --restart=unless-stopped \\
  jellyfin/jellyfin:latest`

const jellywrapDocker = `git clone https://github.com/currentlybuffering/jellywrap.git
cd jellywrap
docker compose up --build`

export default function GettingStartedPage() {
  const { connected, jellyfinUrl } = useVault()
  const [platform, setPlatform] = useState<Platform>('mac')
  const [copied, setCopied] = useState('')
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setDetected(true)
  }, [])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const pInfo = platforms[platform]

  return (
    <main className="min-h-screen bg-vault-950 pt-14">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-black mb-2">
          Get <span className="text-gold">Started</span>
        </h1>
        <p className="text-zinc-500 mb-4">
          Running Jellyfin + JellyWrap takes about 2 minutes. Here&apos;s how.
        </p>

        <div className="flex gap-2 mb-10">
          {(Object.entries(platforms) as [Platform, typeof pInfo][]).map(([key, val]) => {
            const Icon = val.icon
            const active = platform === key
            return (
              <button
                key={key}
                onClick={() => setPlatform(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-zinc-500 border border-vault-700 hover:border-zinc-600 hover:text-zinc-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {val.label}
                {active && detected && (
                  <span className="text-[10px] text-gold/60 ml-1">(yours)</span>
                )}
              </button>
            )
          })}
        </div>

        {connected && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400">
              You&apos;re already connected to {jellyfinUrl.replace(/^https?:\/\//, '')}
            </span>
            <a href="/media" className="btn-gold text-xs ml-auto px-4 py-1.5">
              Browse Media
            </a>
          </div>
        )}

        <div className="space-y-8">
          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                1
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Install Docker</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  If you don&apos;t have Docker, install it for {pInfo.label}:
                </p>
                <div className="relative group mb-4">
                  <pre className="bg-vault-900 border border-vault-700 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto flex items-center justify-between">
                    <code>{pInfo.dockerInstall}</code>
                    <button
                      onClick={() => copy(pInfo.dockerInstall, 'docker-install')}
                      className="text-xs text-zinc-600 hover:text-gold transition-colors ml-2 shrink-0"
                    >
                      {copied === 'docker-install' ? 'Copied' : 'Copy'}
                    </button>
                  </pre>
                </div>
                <p className="text-xs text-zinc-600">
                  No package manager?{' '}
                  <a
                    href="https://docker.com/get-started"
                    className="text-zinc-400 underline underline-offset-2 hover:text-gold transition-colors"
                    target="_blank"
                    rel="noopener"
                  >
                    Download Docker Desktop
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                2
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Start Docker</h2>
                <p className="text-sm text-zinc-400 mb-4">Make sure the Docker daemon is running:</p>
                <div className="relative group mb-4">
                  <pre className="bg-vault-900 border border-vault-700 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto flex items-center justify-between">
                    <code>{pInfo.dockerStart}</code>
                    <button
                      onClick={() => copy(pInfo.dockerStart, 'docker-start')}
                      className="text-xs text-zinc-600 hover:text-gold transition-colors ml-2 shrink-0"
                    >
                      {copied === 'docker-start' ? 'Copied' : 'Copy'}
                    </button>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                3
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Start Jellyfin</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Spin up Jellyfin in a container. Your media goes in <code className="text-gold">./media</code>.
                </p>
                <div className="relative group mb-4">
                  <pre className="bg-vault-900 border border-vault-700 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto max-h-64 flex items-start justify-between">
                    <code>{jellyfinDocker}</code>
                    <button
                      onClick={() => copy(jellyfinDocker, 'jellyfin')}
                      className="text-xs text-zinc-600 hover:text-gold transition-colors ml-2 shrink-0"
                    >
                      {copied === 'jellyfin' ? 'Copied' : 'Copy'}
                    </button>
                  </pre>
                </div>
                <a
                  href="http://localhost:8096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-sm inline-block"
                >
                  Open Jellyfin
                </a>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                4
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Set up your library</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Open Jellyfin at <code className="text-gold">http://localhost:8096</code> and add your media
                  folders. The setup wizard walks you through it.
                </p>
                <a
                  href="http://localhost:8096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm inline-block"
                >
                  Open Jellyfin Setup
                </a>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                5
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Clone &amp; run JellyWrap</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Pull the repo and start the stack. Docker Compose handles everything.
                </p>
                <div className="relative group mb-4">
                  <pre className="bg-vault-900 border border-vault-700 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto flex items-start justify-between">
                    <code>{jellywrapDocker}</code>
                    <button
                      onClick={() => copy(jellywrapDocker, 'jellywrap')}
                      className="text-xs text-zinc-600 hover:text-gold transition-colors ml-2 shrink-0"
                    >
                      {copied === 'jellywrap' ? 'Copied' : 'Copy'}
                    </button>
                  </pre>
                </div>
                <p className="text-xs text-zinc-600">
                  No Git?{' '}
                  <a
                    href="https://github.com/currentlybuffering/jellywrap"
                    className="text-zinc-400 underline underline-offset-2 hover:text-gold transition-colors"
                    target="_blank"
                    rel="noopener"
                  >
                    Download the ZIP from GitHub
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                6
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Connect &amp; go</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Open JellyWrap at <code className="text-gold">http://localhost:3001</code> and point it at
                  your Jellyfin server. All features work immediately.
                </p>
                <a href="/media" className="btn-gold text-sm inline-block">
                  Browse Media
                </a>
              </div>
            </div>
          </div>

          <div className="card-glow">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                7
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-1">Migrate from Plex (optional)</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Coming from Plex? Hit the Migrate page to transfer watch history and ratings automatically.
                </p>
                <a href="/migrate" className="btn-outline text-sm inline-block">
                  Start Migration
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 card border border-gold/20 bg-gold/5">
          <h2 className="font-semibold text-lg mb-2">Try it now — no setup needed</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Use the Jellyfin demo server to explore JellyWrap instantly. No install required.
          </p>

          {connected ? (
            <a href="/media" className="btn-gold inline-block">
              Browse Media
            </a>
          ) : (
            <div className="max-w-md">
              <JellyfinAuthForm
                defaultServerUrl="https://demo.jellyfin.org/stable"
                defaultUsername="demo"
                onConnected={() => {
                  window.location.href = '/media'
                }}
              />
              <p className="text-xs text-zinc-600 mt-3">
                Server: demo.jellyfin.org &middot; Username: demo &middot; No password
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
