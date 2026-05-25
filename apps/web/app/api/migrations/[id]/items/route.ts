import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const API_BASE = process.env.MIGRATION_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(`${API_BASE}/migrations/${params.id}/items`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
