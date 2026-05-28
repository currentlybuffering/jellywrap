import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.MIGRATION_API_URL || 'http://localhost:8080'

export async function GET(req: NextRequest) {
  const inviteId = req.nextUrl.searchParams.get('inviteId')
  if (!inviteId) return NextResponse.json({ error: 'inviteId required' }, { status: 400 })
  const res = await fetch(`${API_BASE}/invites/${inviteId}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
