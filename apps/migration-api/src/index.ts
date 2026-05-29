import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import http from 'http'
import waitlistRouter from './routes/waitlist.js'
import migrationsRouter from './routes/migrations.js'
import smartLibraryRouter from './routes/smart-library.js'
import familyRouter from './routes/family.js'
import invitesRouter from './routes/invites.js'
import watchRouter, { setupWatchWSS } from './routes/watch-together.js'
import cloudRouter from './routes/cloud.js'

const app = express()
const PORT = parseInt(process.env.PORT || '8080', 10)

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.3.0', uptime: process.uptime() })
})

app.use('/waitlist', waitlistRouter)
app.use('/migrations', migrationsRouter)
app.use('/library', smartLibraryRouter)
app.use('/family', familyRouter)
app.use('/invites', invitesRouter)
app.use('/watch', watchRouter)
app.use('/cloud', cloudRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const server = http.createServer(app)
setupWatchWSS(server)

server.listen(PORT, () => {
  console.log(`JellyWrap API v0.3.0 on :${PORT}`)
})

export default app
