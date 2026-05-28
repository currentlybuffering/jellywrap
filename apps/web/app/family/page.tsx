'use client'

import { useState, useEffect } from 'react'
import { useVault } from '@/lib/store'
import JellyfinAuthForm from '@/components/jellyfin-auth-form'

interface FamilyUser {
  id: string
  name: string
  hasPassword: boolean
  isAdmin: boolean
  isDisabled: boolean
  enableMediaPlayback: boolean
  enableRemoteAccess: boolean
  enableLiveTv: boolean
  blockedTags: string[]
  accessSchedules: { DayOfWeek: string; StartHour: number; EndHour: number }[]
}

export default function FamilyPage() {
  const { connected, jellyfinUrl, jellyfinToken, jellyfinUserId } = useVault()
  const [users, setUsers] = useState<FamilyUser[]>([])
  const [newUserName, setNewUserName] = useState('')
  const [newUserPw, setNewUserPw] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const authBody = () => ({ jellyfinUrl, jellyfinToken, jellyfinUserId })

  const loadUsers = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/family/users/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody()),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setUsers(data.users || [])
      setLoaded(true)
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const createUser = async () => {
    if (!newUserName.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/family/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...authBody(), name: newUserName, password: newUserPw }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setNewUserName(''); setNewUserPw('')
      loadUsers()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const togglePolicy = async (uid: string, key: string, value: boolean) => {
    try {
      await fetch(`/api/family/users/${uid}/policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...authBody(), policy: { [key]: value } }),
      })
      loadUsers()
    } catch (err: any) { setError(err.message) }
  }

  const deleteUser = async (uid: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      await fetch(`/api/family/users/${uid}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody()),
      })
      loadUsers()
    } catch (err: any) { setError(err.message) }
  }

  useEffect(() => {
    if (connected && !loaded) loadUsers()
  }, [connected])

  return (
    <main className="min-h-screen bg-vault-950 pt-14">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-black mb-2">Family <span className="text-gold">Controls</span></h1>
        <p className="text-zinc-500 mb-10">Manage users, set restrictions, and control access. Plex charges extra for this.</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mb-6">{error}</div>}

        {!connected && <JellyfinAuthForm />}

        {connected && (
          <div className="space-y-6">
            <div className="card-glow">
              <h2 className="font-semibold text-lg mb-4">Add Family Member</h2>
              <div className="flex gap-3">
                <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Username" className="input-field flex-1" />
                <input type="password" value={newUserPw} onChange={(e) => setNewUserPw(e.target.value)} placeholder="Password (optional)" className="input-field flex-1" />
                <button onClick={createUser} disabled={loading || !newUserName.trim()} className="btn-gold whitespace-nowrap">Add User</button>
              </div>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="card-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${user.isAdmin ? 'bg-gold/20 text-gold' : 'bg-vault-700 text-zinc-400'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-zinc-500 flex gap-2">
                          {user.isAdmin && <span className="text-gold">Admin</span>}
                          {user.isDisabled && <span className="text-red-400">Disabled</span>}
                          {!user.isAdmin && !user.isDisabled && <span>Member</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingUser(editingUser === user.id ? null : user.id)} className="btn-outline text-xs px-3 py-1.5">
                        {editingUser === user.id ? 'Close' : 'Settings'}
                      </button>
                      {!user.isAdmin && (
                        <button onClick={() => deleteUser(user.id)} className="text-xs text-red-400 hover:text-red-300 px-2">Delete</button>
                      )}
                    </div>
                  </div>

                  {editingUser === user.id && (
                    <div className="border-t border-vault-600/50 pt-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-vault-900/50 hover:bg-vault-900 transition-colors">
                          <input type="checkbox" checked={user.enableMediaPlayback} onChange={(e) => togglePolicy(user.id, 'EnableMediaPlayback', e.target.checked)} className="w-4 h-4 accent-gold" />
                          <div>
                            <div className="text-sm">Media Playback</div>
                            <div className="text-xs text-zinc-600">Allow playing media</div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-vault-900/50 hover:bg-vault-900 transition-colors">
                          <input type="checkbox" checked={user.enableRemoteAccess} onChange={(e) => togglePolicy(user.id, 'EnableRemoteAccess', e.target.checked)} className="w-4 h-4 accent-gold" />
                          <div>
                            <div className="text-sm">Remote Access</div>
                            <div className="text-xs text-zinc-600">Access from outside network</div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-vault-900/50 hover:bg-vault-900 transition-colors">
                          <input type="checkbox" checked={user.enableLiveTv} onChange={(e) => togglePolicy(user.id, 'EnableLiveTvAccess', e.target.checked)} className="w-4 h-4 accent-gold" />
                          <div>
                            <div className="text-sm">Live TV</div>
                            <div className="text-xs text-zinc-600">Watch live broadcasts</div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-vault-900/50 hover:bg-vault-900 transition-colors">
                          <input type="checkbox" checked={user.isDisabled} onChange={(e) => togglePolicy(user.id, 'IsDisabled', e.target.checked)} className="w-4 h-4 accent-red-400" />
                          <div>
                            <div className="text-sm text-red-400">Disable Account</div>
                            <div className="text-xs text-zinc-600">Block all access</div>
                          </div>
                        </label>
                      </div>
                      {user.blockedTags.length > 0 && (
                        <div className="text-xs text-zinc-500">
                          Blocked tags: {user.blockedTags.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!loaded && !loading && connected && (
              <div className="text-center py-8">
                <button onClick={loadUsers} className="btn-gold">Load Users</button>
              </div>
            )}

            {loaded && users.length === 0 && !loading && (
              <div className="text-center text-zinc-600 py-16">No users found</div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
