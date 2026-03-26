import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Providers from './providers'
import AppShell from '../src/components/AppShell'

export const metadata: Metadata = {
  title: 'Sammy — social media manager',
  description: 'Plan and monitor short-form content across Instagram, YouTube, and TikTok.',
}

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
