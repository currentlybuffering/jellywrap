'use client'

import { useState } from 'react'
import { useVault } from '@/lib/store'
import JellyfinAuthForm from '@/components/jellyfin-auth-form'
import { Play, Download, Terminal, ChevronDown, ChevronUp, Apple, Monitor, Check, ArrowRight } from 'lucide-react'

type Path = 'demo' | 'cloud' | 'selfhost'
type Platform = 'mac' | 'windows' | 'linux'

const platformInfo: Record<Platform, { label: string; icon: typeof Apple; dockerInstall: string; dockerStart: string }> = {
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
  const { connected } = useVault()
  const [path, setPath] = useState<Path>('demo')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [platform, setPlatform] = useState<Platform>(detectPlatform)
  const [copied, setCopied] = useState('')

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const pInfo = platformInfo[platform]

  const paths: { id: Path; title: string; desc: string; icon: typeof Play; badge?: string }[] = [
    { id: 'demo', title: 'Try it now', desc: 'No install. Browse a live Jellyfin library in 10 seconds.', icon: Play, badge: 'Fastest' },
    { id: 'cloud', title: 'We host it', desc: 'We run Jellyfin for you. Just sign up and stream.', icon: Download, badge: 'Easiest' },
    { id: 'selfhost', title: 'Self-host', desc: 'Run it on your own hardware. Free forever.', icon: Terminal },
  ]

  return (
    <main className="min-h-screen bg-vault-950 pt-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2">
          Get <span className="text-gold">Started</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 mb-8">
          Three ways to use JellyWrap. Pick the one that sounds right for you.
        </p>

        {connected && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400">You&apos;re already connected!</span>
            <a href="/media" className="btn-gold text-xs px-4 py-1.5 ml-auto">
              Browse Media
            </a>
          </div>
        )}

        {/* Path selector */}
        <div className="grid gap-3 mb-8">
          {paths.map(p => {
            const Icon = p.icon
            const active = path === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPath(p.id)}
                className={`text-left p-4 sm:p-5 rounded-xl border transition-all min-h-[44px] ${
                  active
                    ? 'border-gold/30 bg-gold/5 shadow-[0_0_30px_rgba(232,197,71,0.06)]'
                    : 'border-vault-700/50 bg-vault-900/30 hover:border-vault-700 hover:bg-vault-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? 'bg-gold/10 border border-gold/20' : 'bg-vault-800 border border-vault-700/50'
                  }`}>
                    <Icon className={`w-4 h-4 ${active ? 'text-gold' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${active ? 'text-white' : 'text-zinc-300'}`}>{p.title}</span>
                      {p.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          active ? 'bg-gold/10 text-gold' : 'bg-vault-800 text-zinc-500'
                        }`}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>{p.desc}</p>
                  </div>
                  {active && <Check className="w-4 h-4 text-gold shrink-0" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Demo path */}
        {path === 'demo' && (
          <div className="space-y-6">
            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">1</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Connect to the demo server</h2>
                  <p className="text-sm text-zinc-400 mb-4">
                    We&apos;ll connect you to a shared Jellyfin demo server. Browse movies, hit play, explore every feature.
                  </p>
                  {connected ? (
                    <a href="/media" className="btn-gold inline-flex items-center gap-2">
                      <Play className="w-4 h-4" /> Browse Media <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="max-w-md">
                      <JellyfinAuthForm
                        defaultServerUrl="https://demo.jellyfin.org/stable"
                        defaultUsername="demo"
                        onConnected={() => { window.location.href = '/media' }}
                      />
                      <p className="text-xs text-zinc-600 mt-3">
                        Server: demo.jellyfin.org &middot; Username: demo &middot; No password
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">2</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">That&apos;s it</h2>
                  <p className="text-sm text-zinc-400">
                    You&apos;re streaming. Migrate from Plex, set up family controls, or watch together — all from the sidebar.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-vault-900/50 border border-vault-700/30 text-xs text-zinc-500">
              <strong className="text-zinc-400">When you&apos;re ready for your own server:</strong> come back and choose &quot;We host it&quot; or &quot;Self-host&quot; above.
            </div>
          </div>
        )}

        {/* Cloud path */}
        {path === 'cloud' && (
          <div className="space-y-6">
            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">1</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Sign up for a cloud server</h2>
                  <p className="text-sm text-zinc-400 mb-4">
                    We spin up a private Jellyfin server just for you. No Docker, no terminal, no SSH.
                  </p>
                  <a href="/cloud" className="btn-gold inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> Set up cloud server <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">2</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Add your media</h2>
                  <p className="text-sm text-zinc-400">
                    Upload your movies and shows. We handle backups, updates, SSL, and uptime. You just watch.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">3</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Stream from anywhere</h2>
                  <p className="text-sm text-zinc-400">
                    Your library, on any device, anywhere. Mobile apps are free. Remote access is free. Everything is free.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-vault-900/50 border border-vault-700/30">
                <div className="text-sm font-semibold text-white mb-1">Cloud — $5/mo</div>
                <p className="text-xs text-zinc-500">You bring your own Jellyfin server URL. We manage migration, relay, and updates.</p>
              </div>
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
                <div className="text-sm font-semibold text-gold mb-1">Cloud+ — $10/mo</div>
                <p className="text-xs text-zinc-500">We run Jellyfin too. 50GB storage, backups, custom domain. Zero setup.</p>
              </div>
            </div>
          </div>
        )}

        {/* Self-host path */}
        {path === 'selfhost' && (
          <div className="space-y-6">
            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">1</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Download the desktop app</h2>
                  <p className="text-sm text-zinc-400 mb-4">
                    The JellyWrap app bundles everything. Install it, point it at your media folder, and go. No terminal needed.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="https://github.com/currentlybuffering/jellywrap/releases" className="btn-gold text-sm" target="_blank" rel="noopener">
                      <Apple className="w-4 h-4 inline mr-1.5" /> Download for Mac
                    </a>
                    <a href="https://github.com/currentlybuffering/jellywrap/releases" className="btn-outline text-sm" target="_blank" rel="noopener">
                      <Monitor className="w-4 h-4 inline mr-1.5" /> Download for Windows
                    </a>
                  </div>
                  <p className="text-xs text-zinc-600 mt-3">
                    Or keep scrolling for the Docker method (more control, more steps).
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">2</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Add your media</h2>
                  <p className="text-sm text-zinc-400">
                    Drop your movies and shows into the media folder. Jellyfin scans them automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glow">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-sm flex items-center justify-center font-mono font-bold shrink-0">3</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">Stream</h2>
                  <p className="text-sm text-zinc-400">
                    Open the app. Your library is right there. Every feature, no paywalls, forever free.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Docker section — collapsed by default */}
            <div className="border border-vault-700/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Advanced: Docker Compose setup
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="px-4 pb-4 space-y-4 border-t border-vault-700/30 pt-4">
                  <p className="text-xs text-zinc-500">
                    For people comfortable with the terminal. Docker Compose runs Jellyfin + JellyWrap + relay in one command.
                  </p>

                  <div className="flex gap-2 mb-4">
                    {(Object.entries(platformInfo) as [Platform, typeof pInfo][]).map(([key, val]) => {
                      const Icon = val.icon
                      const active = platform === key
                      return (
                        <button
                          key={key}
                          onClick={() => setPlatform(key)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                            active
                              ? 'bg-gold/10 text-gold border border-gold/20'
                              : 'text-zinc-500 border border-vault-700 hover:border-zinc-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {val.label}
                        </button>
                      )
                    })}
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-zinc-400 mb-2">1. Install Docker</h3>
                    <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto flex items-center justify-between gap-2">
                      <code>{pInfo.dockerInstall}</code>
                      <button onClick={() => copy(pInfo.dockerInstall, 'docker-install')} className="text-xs text-zinc-600 hover:text-gold shrink-0">
                        {copied === 'docker-install' ? 'Copied' : 'Copy'}
                      </button>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-zinc-400 mb-2">2. Start Docker</h3>
                    <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto flex items-center justify-between gap-2">
                      <code>{pInfo.dockerStart}</code>
                      <button onClick={() => copy(pInfo.dockerStart, 'docker-start')} className="text-xs text-zinc-600 hover:text-gold shrink-0">
                        {copied === 'docker-start' ? 'Copied' : 'Copy'}
                      </button>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-zinc-400 mb-2">3. Start Jellyfin</h3>
                    <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto max-h-48 flex items-start justify-between gap-2">
                      <code>{jellyfinDocker}</code>
                      <button onClick={() => copy(jellyfinDocker, 'jellyfin')} className="text-xs text-zinc-600 hover:text-gold shrink-0">
                        {copied === 'jellyfin' ? 'Copied' : 'Copy'}
                      </button>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-zinc-400 mb-2">4. Start JellyWrap</h3>
                    <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto flex items-start justify-between gap-2">
                      <code>{jellywrapDocker}</code>
                      <button onClick={() => copy(jellywrapDocker, 'jellywrap')} className="text-xs text-zinc-600 hover:text-gold shrink-0">
                        {copied === 'jellywrap' ? 'Copied' : 'Copy'}
                      </button>
                    </pre>
                  </div>

                  <p className="text-xs text-zinc-600">
                    No Git? <a href="https://github.com/currentlybuffering/jellywrap" className="text-zinc-400 underline hover:text-gold" target="_blank" rel="noopener">Download the ZIP from GitHub</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
