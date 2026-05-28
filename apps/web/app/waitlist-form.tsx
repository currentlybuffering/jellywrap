'use client'

import { FormEvent } from 'react'

export default function WaitlistForm() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements as any).email.value
    if (!email) return
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      form.innerHTML = '<p class="text-gold font-semibold py-3">You\'re in. We\'ll email you when it\'s ready.</p>'
    } catch {
      form.innerHTML = '<p class="text-red-400 py-3">Something went wrong. Try again?</p>'
    }
  }

  return (
    <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="input-field flex-1"
      />
      <button type="submit" className="btn-gold whitespace-nowrap">
        Join Waitlist
      </button>
    </form>
  )
}
