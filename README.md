# JellyWrap

Your media. Your server. Free forever.

Open-source Plex alternative built on Jellyfin. Self-hosted, private, and actually yours. No subscription. No price hikes. No lock-in.

**[jellywrap.net](https://jellywrap.net)** | **[Try the cloud version](https://jellywrap.net/#pricing)**

## Why JellyWrap?

Plex is raising lifetime passes to $750. Jellyfin is free but clunky to set up. JellyWrap gives you:

- **One-click migration** from Plex — watch history, ratings, favorites, all matched by TMDB/TVDB/IMDB IDs
- **Better browsing UX** — poster walls, continue watching, search, detail views with actual playback
- **Smart library tools** — duplicate detection, gap finding, subtitle hunting (coming soon)
- **Social features** — watch together, invite links, family controls (coming soon)
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

- Web app: http://localhost:3000
- Migration API: http://localhost:8080
- Relay agent: http://localhost:8081

### Self-hosted (manual)

```bash
# Migration API
cd apps/migration-api
npm install
cp .env.example .env
npm run dev

# Web app
cd apps/web
npm install
npm run dev

# Relay agent
cd apps/relay-agent
go build ./cmd/
./main
```

### Cloud

Don't want to manage a server? [JellyWrap Cloud](https://jellywrap.net/#pricing) handles migration, hosting, and relay for you. Connect your Jellyfin server and go.

## Migration tool

1. Enter your Plex server URL and token
2. Enter your Jellyfin server URL and credentials
3. Choose what to migrate (watch history, ratings, favorites)
4. Click start — items are matched via 3-tier system:
   - **Tier 1**: Provider IDs (TMDB/TVDB/IMDB) — exact match
   - **Tier 2**: Title + year — high confidence
   - **Tier 3**: Fuzzy title — partial match
5. Review results with confidence scores

## Relay

The relay agent creates a WireGuard tunnel so you can access your media server from anywhere — no port forwarding needed.

```bash
# On your VPS
docker compose up relay-agent

# On your home server
wg-quick up jellywrap.conf
```

## Stack

| Component | Tech |
|-----------|------|
| Web | Next.js 14, Tailwind, Zustand |
| Migration API | Express, better-sqlite3 |
| Relay | Go, WireGuard, Echo |
| Deploy | Docker Compose, Caddy/Traefik |

## Pricing

| Tier | Price | What you get |
|------|-------|-------------|
| Self-hosted | Free | Everything — no feature limits |
| Cloud | $5/mo | Managed migration + relay + hosting |
| Cloud+ | $10/mo | Full managed Jellyfin + all features |

Self-hosted gets every feature. Cloud is just convenience for people who don't want to run their own server.

## Roadmap

- [x] Plex → Jellyfin migration (watch history, ratings, favorites)
- [x] Media browser with real Jellyfin playback
- [x] WireGuard relay for remote access
- [ ] Duplicate detection — find and merge duplicate library entries
- [ ] Gap finding — spot missing seasons/movies in your collection
- [ ] Subtitle hunting — auto-find subtitles for your library
- [ ] Watch together — sync playback with friends
- [ ] Invite links — share your library without sharing credentials
- [ ] Family controls — per-user content restrictions
- [ ] Mobile apps

## License

MIT
