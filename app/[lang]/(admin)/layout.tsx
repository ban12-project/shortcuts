import '../globals.css'

import { auth, signOut } from '#/auth'
import { Locale } from '#/i18n-config'
import { PowerOff } from 'lucide-react'

import { Button } from '#/components/ui/button'
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
          <header className="flex">
            {session && (
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
                className="ml-auto"
              >
                <Button variant="ios">
                  <PowerOff className="w-6" />
                  <div className="hidden md:inline">Sign Out</div>
                </Button>
              </form>
            )}
          </header>

          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
