import type { Metadata } from 'next'
import Script from 'next/script'

import { Inter } from 'next/font/google'

import '@/styles/globals.css'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Travista',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          strategy='beforeInteractive'
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NAVER_MAP_CLIENT_ID}`}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider >
          <Header />
          <main className=''>
              {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
