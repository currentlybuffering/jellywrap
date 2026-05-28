import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { serverUrl, username, password, deviceId } = await req.json()

  if (!serverUrl || !username) {
    return NextResponse.json({ error: 'Server URL and username are required.' }, { status: 400 })
  }

  try {
    const res = await fetch(`${serverUrl.replace(/\/+$/, '')}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser Client="JellyWrap", Device="Web", DeviceId="${deviceId || 'jw-server'}", Version="0.1.0"`,
      },
      body: JSON.stringify({ Username: username, Pw: password || '' }),
    })

    if (!res.ok) {
      const messages: Record<number, string> = {
        401: 'Wrong username or password. Please check your credentials.',
        404: 'Server not found. Check the URL and try again.',
      }
      return NextResponse.json({ error: messages[res.status] || 'Could not connect to server. Check the URL and try again.' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      serverUrl: serverUrl.replace(/\/+$/, ''),
      token: data.AccessToken,
      userId: data.User?.Id || data.SessionInfo?.UserId,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Can\'t reach the server. Check that the URL is correct and the server is running.' }, { status: 502 })
  }
}
