# JellyWrap

Your media. Your server. Free forever.

Open-source Plex alternative built on Jellyfin. Self-hosted, private, and actually yours. No subscription. No price hikes. No lock-in.

**[jellywrap.net](https://jellywrap.net)** | **[Try the demo](https://jellywrap.net/getting-started)**

## Why JellyWrap?

Plex is raising lifetime passes to $750. Jellyfin is free but clunky to set up. JellyWrap gives you:

- **Plex migration** — watch history, ratings, favorites, matched by TMDB/TVDB/IMDB IDs
- **Better browsing UX** — poster walls, continue watching, search, detail views with playback
- **Smart library tools** — duplicate detection, gap finding, subtitle hunting
- **Social features** — watch together rooms, invite links, family controls
- **Remote access relay** — WireGuard tunnel, no port forwarding needed
- **Self-hosted or cloud** — run it yourself for free, or let us handle the server

## Quick start

### Self-hosted (Docker)

```bash
git clone https://github.com/currentlybuffering/jellywrap.git
cd jellywrap
cp .env.example .env
docker compose up --build
```

- Web app: http://localhost:3001
- Jellyfin: http://localhost:8096
- Migration API: http://localhost:8080

> **New to Docker?** See the [Getting Started guide](https://jellywrap.net/getting-started) for step-by-step instructions with OS auto-detection.

### Cloud

Don't want to manage a server? [JellyWrap Cloud](https://jellywrap.net/#pricing) handles migration, hosting, and relay for you. Connect your Jellyfin server and go.

## Features

### Plex Migration

Transfer your watch history, ratings, and favorites from Plex to Jellyfin. 3-tier matching system:

1. **Provider IDs** (TMDB/TVDB/IMDB) — exact match
2. **Title + year** — high confidence
3. **Fuzzy title** — partial match

Review results with confidence scores before committing.

### Media Browser

Browse your Jellyfin library with poster walls, continue watching, search, and detail views. Playback works directly in the browser.

### Smart Library

- **Duplicate detection** — find and merge duplicate entries in your library
- **Gap finder** — spot missing seasons/movies in your collection (requires `TMDB_API_KEY`)
- **Subtitle hunt** — search for subtitles via Gestdown

### Watch Together

Create a room, share the invite link, and watch in sync with friends. Play/pause/seek stays synchronized across all peers.

### Family Controls

Manage Jellyfin users, toggle access policies, and create new accounts — all from one page.

### Relay

The relay agent creates a WireGuard tunnel so you can access your media server from anywhere — no port forwarding needed.

## Stack

| Component | Tech |
|-----------|------|
| Web | Next.js 14, Tailwind, Zustand |
| Migration API | Express, better-sqlite3 |
| Relay | Go, WireGuard, Echo |
| Deploy | Docker Compose, Caddy/Traefik |

## Roadmap

### Working

- [x] Plex → Jellyfin migration (watch history, ratings, favorites)
- [x] Media browser with Jellyfin playback
- [x] Duplicate detection
- [x] Watch together rooms
- [x] Invite links
- [x] Family controls
- [x] WireGuard relay for remote access

### In progress

- [ ] Gap finder — spot missing seasons/movies (needs TMDB API key setup)
- [ ] Subtitle hunt — search external subtitle sources
- [ ] Mobile apps (Tauri desktop apps available)

### Planned

- [ ] One-click Plex token extraction (no manual token lookup)
- [ ] Reconnect logic for watch together rooms
- [ ] Parental rating limits in family controls
- [ ] Playlist migration from Plex
- [ ] Auto-update mechanism for self-hosted

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JELLYFIN_URL` | No | Default Jellyfin server URL |
| `MIGRATION_API_URL` | No | Migration API URL (default: `http://localhost:8080`) |
| `ALLOWED_ORIGINS` | No | CORS origins (default: `http://localhost:3001`) |
| `TMDB_API_KEY` | No | TMDB API key for gap finder |
| `JWT_SECRET` | Yes | Secret for signing tokens (change in production!) |

## License

MIT
