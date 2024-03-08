import './globals.css'

import { Inter } from 'next/font/google'
import { Locale } from '#/i18n-config'

import { cn } from '#/lib/utils'
import CSSPaintPolyfill from '#/components/css-paint-polyfill'

import { Providers } from './providers'

type RootLayoutProps = {
  params: { lang: Locale }
  children: React.ReactNode
  detail: React.ReactNode
  post: React.ReactNode
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: {
    default: 'Shortcuts',
    template: '%s - Ban12',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ params, children, detail, post }: RootLayoutProps) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={cn(
          'bg-white font-sans text-black antialiased dark:bg-black dark:text-white',
          inter.variable,
        )}
      >
        <Providers>
          {children}
          {detail}
          {post}
        </Providers>

        {/* <CSSPaintPolyfill /> */}
      </body>
    </html>
  )
}
