'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useVault } from '@/lib/store'
import { Github, Shield } from 'lucide-react'

const landingLinks = [
  { href: '/getting-started', label: 'Get Started' },
  { href: '/migrate', label: 'Migrate' },
  { href: '/#compare', label: 'Compare' },
  { href: '/#pricing', label: 'Pricing' },
]

const appLinks = [
  { href: '/media', label: 'Media' },
  { href: '/library', label: 'Smart Library' },
  { href: '/watch', label: 'Watch Together' },
  { href: '/family', label: 'Family' },
  { href: '/migrate', label: 'Migrate' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { connected, jellyfinUrl, logout } = useVault()
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === '/invite/[id]') return null

  const isLanding = pathname === '/'
  const links = isLanding ? landingLinks : appLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vault-950/90 backdrop-blur-xl border-b border-vault-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="font-display font-bold text-lg bg-gradient-to-r from-gold to-gold-dim bg-clip-text text-transparent">
            JellyWrap
          </Link>
          <a
            href="https://github.com/currentlybuffering/jellywrap"
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono text-zinc-500 border border-vault-600 rounded-md hover:border-gold/30 hover:text-gold transition-colors"
          >
            <Github className="w-3 h-3" />
            MIT
          </a>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-zinc-600 border border-vault-700/50 rounded-md">
            <Shield className="w-3 h-3" />
            Zero telemetry
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === href
                  ? 'text-gold bg-gold/10'
                  : 'text-zinc-400 hover:text-white hover:bg-vault-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {connected && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="truncate max-w-[160px]">{jellyfinUrl.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {connected && (
            <button
              onClick={logout}
              className="hidden sm:block text-xs text-zinc-500 hover:text-red-400 transition-colors min-h-[44px]"
            >
              Disconnect
            </button>
          )}
          {!isLanding && (
            <Link
              href="/getting-started"
              className="hidden sm:inline-flex btn-gold !text-xs !px-3 !py-1.5"
            >
              Getting Started
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-white rounded-lg hover:bg-vault-800/50 transition-colors"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {menuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-vault-700/50 bg-vault-950/98 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center min-h-[44px] px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === href ? 'text-gold bg-gold/5' : 'text-zinc-400 hover:text-white hover:bg-vault-800/50'
                }`}
              >
                {label}
              </Link>
            ))}
            {connected && (
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="flex items-center w-full min-h-[44px] px-3 py-2.5 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                Disconnect
              </button>
            )}
            <a
              href="https://github.com/currentlybuffering/jellywrap"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 min-h-[44px] px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-vault-800/50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <div className="flex items-center gap-2 min-h-[44px] px-3 py-2.5 text-xs text-zinc-600">
              <Shield className="w-3.5 h-3.5" />
              Zero telemetry · MIT License
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
