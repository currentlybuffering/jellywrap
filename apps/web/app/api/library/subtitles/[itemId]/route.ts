import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.MIGRATION_API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest, { params }: { params: { itemId: string } }) {
  const body = await req.json()
  const res = await fetch(`${API_BASE}/library/subtitles/${params.itemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
