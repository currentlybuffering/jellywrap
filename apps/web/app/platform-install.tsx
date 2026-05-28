'use client'

import { useState, useEffect } from 'react'
import { Apple, Monitor, Terminal } from 'lucide-react'

type Platform = 'mac' | 'windows' | 'linux'

const platformInfo: Record<Platform, {
  label: string
  icon: typeof Apple
  dockerInstall: string
  dockerCmd: string
  runCmd: string
}> = {
  mac: {
    label: 'macOS',
    icon: Apple,
    dockerInstall: 'brew install --cask docker',
    dockerCmd: 'open -a Docker',
    runCmd: 'git clone https://github.com/currentlybuffering/jellywrap.git && cd jellywrap && docker compose up --build',
  },
  windows: {
    label: 'Windows',
    icon: Monitor,
    dockerInstall: 'winget install Docker.DockerDesktop',
    dockerCmd: '"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
    runCmd: 'git clone https://github.com/currentlybuffering/jellywrap.git && cd jellywrap && docker compose up --build',
  },
  linux: {
    label: 'Linux',
    icon: Terminal,
    dockerInstall: 'curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER',
    dockerCmd: 'sudo systemctl start docker',
    runCmd: 'git clone https://github.com/currentlybuffering/jellywrap.git && cd jellywrap && docker compose up --build',
  },
}

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'mac'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac') || ua.includes('darwin')) return 'mac'
  return 'linux'
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-zinc-600 hover:text-gold transition-colors"
      aria-label="Copy"
    >
      {copied ? <span className="text-green-400 text-xs">copied</span> : <span className="text-xs">copy</span>}
    </button>
  )
}

export default function PlatformInstall() {
  const [platform, setPlatform] = useState<Platform>('mac')
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setDetected(true)
  }, [])

  const info = platformInfo[platform]

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(Object.entries(platformInfo) as [Platform, typeof info][]).map(([key, val]) => {
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
                <span className="text-[10px] text-gold/60 ml-1">(detected)</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        <div className="relative group">
          <div className="text-[11px] text-zinc-600 font-mono mb-1">1. Install Docker</div>
          <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-sm text-zinc-300 font-mono overflow-x-auto flex items-center justify-between">
            <code>{info.dockerInstall}</code>
            <CopyBtn text={info.dockerInstall} />
          </pre>
        </div>

        <div className="relative group">
          <div className="text-[11px] text-zinc-600 font-mono mb-1">2. Start Docker</div>
          <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-sm text-zinc-300 font-mono overflow-x-auto flex items-center justify-between">
            <code>{info.dockerCmd}</code>
            <CopyBtn text={info.dockerCmd} />
          </pre>
        </div>

        <div className="relative group">
          <div className="text-[11px] text-zinc-600 font-mono mb-1">3. Clone &amp; run JellyWrap</div>
          <pre className="bg-vault-900 border border-vault-700 rounded-lg p-3 text-sm text-zinc-300 font-mono overflow-x-auto flex items-center justify-between">
            <code>{info.runCmd}</code>
            <CopyBtn text={info.runCmd} />
          </pre>
        </div>

        <p className="text-xs text-zinc-600 mt-2">
          Don&apos;t have Git?{' '}
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
  )
}
