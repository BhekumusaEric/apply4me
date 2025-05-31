import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import { InstallPrompt } from '@/components/pwa/install-prompt'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'Apply4Me - South African Student Application Platform',
  description: 'Simplifying higher education applications for South African students. Apply to universities, colleges, and TVET institutions with ease.',
  keywords: 'South Africa, university applications, college applications, TVET, NSFAS, student applications, higher education',
  authors: [{ name: 'Bhekumusa Eric Ntshwenya' }],
  creator: 'Bhekumusa Eric Ntshwenya',
  publisher: 'Bhekumusa Eric Ntshwenya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Apply4Me',
  },
  openGraph: {
    type: 'website',
    siteName: 'Apply4Me',
    title: 'Apply4Me - South African Student Application Platform',
    description: 'Simplifying higher education applications for South African students.',
    url: 'https://apply4me.co.za',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Apply4Me - Student Application Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply4Me - South African Student Application Platform',
    description: 'Simplifying higher education applications for South African students.',
    images: ['/og-image.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#007A4D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Apply4Me" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#007A4D" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <ServiceWorkerRegistration />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
