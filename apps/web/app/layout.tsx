import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/client-layout'

export const metadata: Metadata = {
  title: 'JellyWrap — Your media. Your server. Free forever.',
  description: 'Plex just went to $750. JellyWrap is the free, open-source alternative. Self-hosted, private, and actually yours.',
  openGraph: {
    title: 'JellyWrap — Your media. Your server. Free forever.',
    description: 'Plex just went to $750. JellyWrap is the free, open-source alternative.',
    type: 'website',
    url: 'https://jellywrap.net',
    images: [{ url: 'https://jellywrap.net/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JellyWrap — Your media. Your server. Free forever.',
    description: 'Plex just went to $750. JellyWrap is the free, open-source alternative.',
    images: ['https://jellywrap.net/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-vault-950 text-white font-body antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
