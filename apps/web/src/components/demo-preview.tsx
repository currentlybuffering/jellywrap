'use client'

import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'

const DEMO_URL = 'https://demo.jellyfin.org/stable'
const FALLBACK = [
  { id: '5e6e8380563c5211106652362c5c6843', title: 'Night of the Living Dead', year: 1968, color: 'from-zinc-800/60 to-vault-800' },
  { id: 'c002f0f88ee970cce7f138bbc925de64', title: 'Dracula', year: 1931, color: 'from-red-900/40 to-vault-800' },
  { id: 'e16725e2c1c4367ec596cf93c38bbe4f', title: 'Jungle Book', year: 1942, color: 'from-green-900/40 to-vault-800' },
  { id: '788ae1cdf3816e3441e29dd3a96ddfe1', title: 'The Great Train Robbery', year: 1903, color: 'from-amber-900/40 to-vault-800' },
  { id: 'b07f6514a3e3aa7d8c273458c9cd4c82', title: 'King Lear', year: 1953, color: 'from-purple-900/40 to-vault-800' },
]

interface Movie {
  id: string
  title: string
  year: number
  color: string
  posterUrl?: string
}

export default function DemoPreview() {
  const [movies, setMovies] = useState<Movie[]>(FALLBACK)
  const [token, setToken] = useState('')

  useEffect(() => {
    const deviceId = 'jw-landing-' + crypto.randomUUID()
    fetch(`${DEMO_URL}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser Client="JellyWrap", Device="Web", DeviceId="${deviceId}", Version="0.1.0"`,
      },
      body: JSON.stringify({ Username: 'demo', Pw: '' }),
    })
      .then(r => r.json())
      .then(data => {
        const t = data.AccessToken
        if (!t) return
        setToken(t)
        const uid = data.User?.Id
        if (!uid) return
        return fetch(`${DEMO_URL}/Users/${uid}/Items?Recursive=true&IncludeItemTypes=Movie&SortBy=SortName&Limit=5&Fields=ProductionYear`, {
          headers: { 'X-Emby-Token': t },
        })
      })
      .then(r => r?.json())
      .then(data => {
        if (!data?.Items) return
        const colors = ['from-zinc-800/60 to-vault-800', 'from-red-900/40 to-vault-800', 'from-green-900/40 to-vault-800', 'from-amber-900/40 to-vault-800', 'from-purple-900/40 to-vault-800']
        const mapped: Movie[] = data.Items.slice(0, 5).map((item: any, i: number) => ({
          id: item.Id,
          title: item.Name,
          year: item.ProductionYear || 0,
          color: colors[i % colors.length],
          posterUrl: item.ImageTags?.Primary
            ? `${DEMO_URL}/Items/${item.Id}/Images/Primary?maxWidth=300&tag=${item.ImageTags.Primary}`
            : undefined,
        }))
        if (mapped.length > 0) setMovies(mapped)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-2xl animate-fade-in-up delay-700">
      <div className="glass rounded-xl overflow-hidden shadow-[0_0_60px_rgba(232,197,71,0.06)]">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          </div>
          <span className="text-[11px] text-zinc-600 font-mono ml-2">jellywrap.net/media</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {movies.map((item) => (
              <a key={item.id} href="/media?demo=true" className="group block">
                <div className={`aspect-[2/3] rounded-lg overflow-hidden mb-1.5 relative transition-transform group-hover:scale-[1.03]`}>
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-end p-2`}>
                      <div className="w-full">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          <Play className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <div className="w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-3.5 h-3.5 text-vault-950 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-zinc-400 truncate">{item.title}</div>
                <div className="text-[9px] sm:text-[10px] text-zinc-600">{item.year}</div>
              </a>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-zinc-500">Live demo · {movies.length} movies with real posters</span>
            </div>
            <a href="/media?demo=true" className="text-[11px] text-gold/70 hover:text-gold transition-colors">
              Open full screen →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
