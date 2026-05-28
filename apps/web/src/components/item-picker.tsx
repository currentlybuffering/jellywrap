'use client'

import { useState, useEffect, useRef } from 'react'
import { useVault } from '@/lib/store'
import { JellyfinClient } from '@/lib/jellyfin'

interface ItemPickerProps {
  value: string
  onChange: (itemId: string, itemName: string) => void
  placeholder?: string
  mediaTypes?: string[]
}

export default function ItemPicker({ value, onChange, placeholder = 'Search for a movie or show...', mediaTypes }: ItemPickerProps) {
  const { jellyfinUrl, jellyfinToken, jellyfinUserId } = useVault()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = async (q: string) => {
    setQuery(q)
    if (q.length < 2 || !jellyfinUrl || !jellyfinToken) { setResults([]); return }
    setLoading(true)
    try {
      const client = new JellyfinClient(jellyfinUrl)
      ;(client as any).token = jellyfinToken
      ;(client as any).userId = jellyfinUserId
      const items = await client.search(q, 15)
      const filtered = mediaTypes
        ? items.filter((i: any) => mediaTypes.includes(i.Type))
        : items
      setResults(filtered)
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const select = (item: any) => {
    onChange(item.Id, item.Name)
    setSelectedName(item.Name)
    setQuery('')
    setOpen(false)
  }

  const displayValue = selectedName || (value ? 'Item selected' : '')

  return (
    <div ref={wrapRef} className="relative">
      {displayValue && !open ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setOpen(true); setSelectedName('') }}
            className="input-field text-left flex items-center justify-between"
          >
            <span className="text-gold truncate">{displayValue}</span>
            <span className="text-xs text-zinc-500">Change</span>
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="input-field"
          autoFocus={open}
        />
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-vault-800 border border-vault-600 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
          {results.map((item) => (
            <button
              key={item.Id}
              onClick={() => select(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-vault-700 transition-colors"
            >
              {item.ImageTags?.Primary ? (
                <img
                  src={`${jellyfinUrl}/Items/${item.Id}/Images/Primary?maxWidth=40`}
                  alt=""
                  className="w-8 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-8 h-12 bg-vault-900 rounded flex items-center justify-center text-zinc-600 text-xs">
                  {item.Type === 'Movie' ? 'M' : item.Type === 'Series' ? 'TV' : 'M'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.Name}</div>
                <div className="text-xs text-zinc-500">
                  {item.Type} {item.ProductionYear ? `(${item.ProductionYear})` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && loading && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-vault-800 border border-vault-600 rounded-lg shadow-xl p-4 text-center text-sm text-zinc-500 z-50">
          Searching...
        </div>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-vault-800 border border-vault-600 rounded-lg shadow-xl p-4 text-center text-sm text-zinc-500 z-50">
          No results found
        </div>
      )}

      <input type="hidden" value={value} />
    </div>
  )
}
