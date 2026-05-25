import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const plexUrl = req.headers.get('X-Plex-URL')
  const plexToken = req.headers.get('X-Plex-Token')
  const plexPath = req.nextUrl.searchParams.get('path')

  if (!plexUrl || !plexToken || !plexPath) {
    return NextResponse.json({ error: 'X-Plex-URL, X-Plex-Token headers and path query param required' }, { status: 400 })
  }

  const targetUrl = `${plexUrl.replace(/\/+$/, '')}${plexPath}`
  const allowedPaths = ['/library/sections', '/my/account', '/status/sessions/history/all', '/hubs/']

  if (!allowedPaths.some((p) => plexPath.startsWith(p)) && !/^\/library\/sections\/\d+/.test(plexPath)) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'X-Plex-Token': plexToken,
'X-Plex-Client-Identifier': 'jellywrap-migration',
'X-Plex-Product': 'JellyWrap',
        'X-Plex-Version': '0.1.0',
        'Accept': 'application/json',
      },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
