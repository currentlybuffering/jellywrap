'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useVault } from '@/lib/store'
import { JellyfinClient } from '@/lib/jellyfin'
import JellyfinAuthForm from '@/components/jellyfin-auth-form'
import {
  Film, Library, Users, ArrowRightLeft, Radio, Cloud,
  Menu, X, Shield, Github, ChevronRight, Sparkles
} from 'lucide-react'
import OnboardingWalkthrough from '@/components/onboarding-walkthrough'

const navItems = [
  { href: '/media', label: 'Media', icon: Film, desc: 'Browse & play' },
  { href: '/library', label: 'Smart Library', icon: Library, desc: 'Gaps & dupes' },
  { href: '/watch', label: 'Watch Together', icon: Radio, desc: 'Sync playback' },
  { href: '/family', label: 'Family', icon: Users, desc: 'Controls' },
  { href: '/migrate', label: 'Migrate', icon: ArrowRightLeft, desc: 'Plex → here' },
  { href: '/cloud', label: 'Cloud', icon: Cloud, desc: 'Managed server' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { connected, jellyfinUrl, jellyfinToken, jellyfinUserId, logout } = useVault()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [client, setClient] = useState<JellyfinClient | null>(null)

  useEffect(() => {
    if (connected && jellyfinUrl && jellyfinToken && jellyfinUserId) {
      setClient(new JellyfinClient(jellyfinUrl, jellyfinToken, jellyfinUserId))
    }
  }, [connected, jellyfinUrl, jellyfinToken, jellyfinUserId])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const [showOnboarding, setShowOnboarding] = useState(false)

  const restartOnboarding = () => {
    try { localStorage.removeItem('jw-onboarding-done') } catch {}
    setShowOnboarding(true)
    setTimeout(() => setShowOnboarding(false), 100)
  }

  if (!connected) {
    return (
      <main className="min-h-screen bg-vault-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="font-display font-bold text-2xl bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
              JellyWrap
            </Link>
            <p className="text-sm text-zinc-500 mt-2">Connect to your Jellyfin server to get started</p>
          </div>
          <JellyfinAuthForm onConnected={() => window.location.reload()} defaultServerUrl={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true' ? 'https://demo.jellyfin.org/stable' : undefined} defaultUsername={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true' ? 'demo' : undefined} />
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-600 mb-3">No Jellyfin? Try the demo:</p>
            <Link href="/media?demo=true" className="text-xs text-gold/70 hover:text-gold transition-colors inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Launch demo server
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const activeItem = navItems.find(item => pathname.startsWith(item.href))

  return (
    <div className="min-h-screen bg-vault-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-vault-700/50 bg-vault-900/30 shrink-0">
        <div className="p-4 border-b border-vault-700/50">
          <Link href="/" className="font-display font-bold text-lg bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
            JellyWrap
          </Link>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="truncate">{jellyfinUrl.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname.startsWith(href)
          const navId = `nav-${href.replace('/', '')}`
          return (
            <Link
              key={href}
              href={href}
              id={navId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px] ${
                  active
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-zinc-400 hover:text-white hover:bg-vault-800/50 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-medium">{label}</div>
                  <div className={`text-[10px] ${active ? 'text-gold/60' : 'text-zinc-600'}`}>{desc}</div>
                </div>
              </Link>
            )
          })}
        </nav>

      <div className="p-3 border-t border-vault-700/50 space-y-2">
        <button
          onClick={restartOnboarding}
          className="flex items-center w-full gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-gold hover:bg-gold/5 transition-colors min-h-[36px]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Restart tour
        </button>
        <a
            href="https://github.com/currentlybuffering/jellywrap"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:bg-vault-800/50 transition-colors min-h-[36px]"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub · MIT
          </a>
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-600">
            <Shield className="w-3.5 h-3.5" />
            Zero telemetry
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full gap-2 px-3 py-2 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors min-h-[36px]"
          >
            Disconnect
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-vault-950 border-r border-vault-700/50 flex flex-col animate-slide-in-left">
            <div className="p-4 border-b border-vault-700/50 flex items-center justify-between">
              <Link href="/" className="font-display font-bold text-lg bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
                JellyWrap
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-vault-800/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map(({ href, label, icon: Icon, desc }) => {
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all min-h-[44px] ${
                      active
                        ? 'bg-gold/10 text-gold border border-gold/20'
                        : 'text-zinc-400 hover:text-white hover:bg-vault-800/50 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className={`text-xs ${active ? 'text-gold/60' : 'text-zinc-600'}`}>{desc}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>
            <div className="p-3 border-t border-vault-700/50">
              <button
                onClick={() => { logout(); setSidebarOpen(false) }}
                className="flex items-center w-full gap-2 px-3 py-3 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors min-h-[44px]"
              >
                Disconnect
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-vault-700/50 bg-vault-950/90 backdrop-blur-xl sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-vault-800/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="font-display font-bold text-base bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
            JellyWrap
          </Link>
          {activeItem && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-400 ml-auto">
              <activeItem.icon className="w-4 h-4 text-gold" />
              {activeItem.label}
            </div>
          )}
        </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>

    <OnboardingWalkthrough />
  </div>
  )
}
