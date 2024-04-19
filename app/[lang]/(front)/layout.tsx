import '../globals.css'

import { Inter } from 'next/font/google'
import { Locale } from '#/i18n-config'
import { ThemeProvider } from 'next-themes'

import { cn } from '#/lib/utils'
import CSSPaintPolyfill from '#/components/css-paint-polyfill'
import { LocaleProvider } from '#/components/i18n'

type RootLayoutProps = {
  params: { lang: Locale }
  children: React.ReactNode
  shortcut: React.ReactNode
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

export default function RootLayout({
  params,
  children,
  shortcut,
  post,
}: RootLayoutProps) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={cn(
          'bg-white font-sans text-black antialiased dark:bg-black dark:text-white',
          inter.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={params.lang}>
            {children}
            {shortcut}
            {post}
          </LocaleProvider>
        </ThemeProvider>

        {/* <CSSPaintPolyfill /> */}

        {/* <!-- Cloudflare Web Analytics --> */}
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "13220e15fc4f4e2d8f78c137e3fd7b22"}'
          ></script>
        )}
        {/* <!-- End Cloudflare Web Analytics --> */}
      </body>
    </html>
  )
}
