'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'jw-onboarding-done'

const steps = [
  {
    target: 'nav-media',
    title: 'Browse your media',
    body: 'Your movies and shows live here. Hit play to start streaming instantly — no extra apps needed.',
    href: '/media',
  },
  {
    target: 'nav-library',
    title: 'Smart Library tools',
    body: 'Find duplicates, missing episodes, and hunt for subtitles. Tools Plex doesn\'t give you.',
    href: '/library',
  },
  {
    target: 'nav-watch',
    title: 'Watch Together',
    body: 'Sync playback with friends in real time. No Plex Pass required.',
    href: '/watch',
  },
  {
    target: 'nav-family',
    title: 'Family Controls',
    body: 'Set per-user restrictions and content policies. Plex charges extra for this — yours free.',
    href: '/family',
  },
  {
    target: 'nav-migrate',
    title: 'Migrate from Plex',
    body: 'Bring your watch history, ratings, and playlists over in one click.',
    href: '/migrate',
  },
  {
    target: 'nav-cloud',
    title: 'Cloud Hosting',
    body: 'Don\'t want to self-host? We\'ll run Jellyfin for you. Just sign up and stream.',
    href: '/cloud',
  },
]

export default function OnboardingWalkthrough() {
  const pathname = usePathname()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY)
      if (!done) setVisible(true)
    } catch {}
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }, [])

  const next = useCallback(() => {
    if (step < steps.length - 1) {
      const nextStep = step + 1
      setStep(nextStep)
      router.push(steps[nextStep].href)
    } else {
      dismiss()
    }
  }, [step, router, dismiss])

  const prev = useCallback(() => {
    if (step > 0) {
      const prevStep = step - 1
      setStep(prevStep)
      router.push(steps[prevStep].href)
    }
  }, [step, router])

  useEffect(() => {
    const idx = steps.findIndex(s => s.href === pathname)
    if (idx >= 0 && idx !== step) setStep(idx)
  }, [pathname, step])

  if (!visible) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={dismiss} />
      <div className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm">
        <div className="bg-vault-900 border border-gold/30 rounded-xl shadow-2xl shadow-gold/10 p-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-xs text-gold/70 font-medium uppercase tracking-wider">
                {step + 1} / {steps.length}
              </span>
            </div>
            <button onClick={dismiss} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-vault-800/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{current.body}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[36px] px-2"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setStep(i); router.push(steps[i].href) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-gold w-4' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex items-center gap-1 text-xs font-medium bg-gold/10 text-gold hover:bg-gold/20 rounded-lg px-3 py-2 transition-colors min-h-[36px]"
            >
              {isLast ? 'Get started' : 'Next'}
              {!isLast && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
