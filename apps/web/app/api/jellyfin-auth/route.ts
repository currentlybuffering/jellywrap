import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { serverUrl, username, password } = await req.json()

  if (!serverUrl || !username) {
    return NextResponse.json({ error: 'serverUrl and username required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${serverUrl.replace(/\/+$/, '')}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser Client="JellyWrap", Device="SmartLibrary", DeviceId="jw-smartlib", Version="0.1.0"`,
      },
      body: JSON.stringify({ Username: username, Pw: password || '' }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: `Jellyfin auth failed: ${text.slice(0, 200)}` }, { status: 401 })
    }

    const data = await res.json()
    return NextResponse.json({
      token: data.AccessToken,
      userId: data.User?.Id || data.SessionInfo?.UserId,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
