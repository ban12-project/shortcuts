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
  get: React.ReactNode
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
  get,
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
            {get}
            {post}
          </LocaleProvider>
        </ThemeProvider>

        {/* <CSSPaintPolyfill /> */}

        {/* <!-- Cloudflare Web Analytics --> */}
        {process.env.NEXT_PUBLIC_CF_BEACON && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`"token": "${process.env.NEXT_PUBLIC_CF_BEACON}"`}
          ></script>
        )}
        {/* <!-- End Cloudflare Web Analytics --> */}
      </body>
    </html>
  )
}
