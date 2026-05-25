import { Router } from 'express'
import { addWaitlist, getWaitlistCount } from '../db-queries.js'

const router = Router()

router.post('/', (req, res) => {
  const { email, source } = req.body
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email required' })
    return
  }
  const added = addWaitlist(email.toLowerCase().trim(), source || 'landing')
  if (!added) {
    res.json({ ok: true, duplicate: true, count: getWaitlistCount() })
    return
  }
  res.json({ ok: true, duplicate: false, count: getWaitlistCount() })
})

router.get('/count', (_req, res) => {
  res.json({ count: getWaitlistCount() })
})

export default router
