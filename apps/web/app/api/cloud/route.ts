import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.MIGRATION_API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${API_BASE}/cloud/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    const res = await fetch(`${API_BASE}/cloud/my-servers?email=${encodeURIComponent(email || '')}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
