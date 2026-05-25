import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import waitlistRouter from './routes/waitlist.js'
import migrationsRouter from './routes/migrations.js'

const app = express()
const PORT = parseInt(process.env.PORT || '8080', 10)

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', uptime: process.uptime() })
})

app.use('/waitlist', waitlistRouter)
app.use('/migrations', migrationsRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`JellyWrap migration API v0.1.0 on :${PORT}`)
})

export default app
