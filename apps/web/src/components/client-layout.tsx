'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import AppShell from './app-shell'

const landingPaths = ['/', '/getting-started']

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = landingPaths.includes(pathname) || pathname.startsWith('/invite/')

  if (isLanding) {
    return (
      <>
        <Navbar />
        {children}
      </>
    )
  }

  return <AppShell>{children}</AppShell>
}
