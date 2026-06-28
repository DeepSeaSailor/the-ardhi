import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Ardhi — Property Management for Uganda',
  description: 'Rental property management platform for landlords and tenants across Uganda.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1B3A2D" />
      </head>
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: 0 }}>{children}</body>
    </html>
  )
}
