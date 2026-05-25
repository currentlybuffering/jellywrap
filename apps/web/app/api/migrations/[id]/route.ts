import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const API_BASE = process.env.MIGRATION_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(`${API_BASE}/migrations/${params.id}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const API_BASE = process.env.MIGRATION_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(`${API_BASE}/migrations/${params.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
