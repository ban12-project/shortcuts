import '../globals.css'

import { auth, signOut } from '#/auth'
import { Locale } from '#/i18n-config'
import { PowerOff } from 'lucide-react'

import { LocaleProvider } from '#/components/i18n'

type RootLayoutProps = {
  params: { lang: Locale }
  children: React.ReactNode
}

export default async function Layout({ params, children }: RootLayoutProps) {
  const session = await auth()

  return (
    <html lang={params.lang}>
      <body>
        <LocaleProvider locale={params.lang}>
          {session && (
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                <PowerOff className="w-6" />
                <div className="hidden md:block">Sign Out</div>
              </button>
            </form>
          )}

          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
