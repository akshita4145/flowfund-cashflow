import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { DemoProvider } from '@/lib/demo-context'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: 'FlowFund - Cash Flow Forecasting & Insights',
  description: 'Predict your cash runway, track spending drivers, and make smarter financial decisions with FlowFund.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1f36',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_geistMono.variable} font-sans antialiased`}>
        <DemoProvider>{children}</DemoProvider>
        <Analytics />
      </body>
    </html>
  )
}
