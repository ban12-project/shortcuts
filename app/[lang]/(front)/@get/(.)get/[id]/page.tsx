import { Suspense } from 'react'
import { getDictionary } from '#/get-dictionary'
import { Loader, Share } from 'lucide-react'

import PageDrawer from '#/components/ui/page-drawer'
import ShortcutAdd, { ShortcutAddProps } from '#/components/ui/shortcut-add'

export default async function ShortcutPage({
  params,
}: Omit<ShortcutAddProps, 'messages'>) {
  const messages = await getDictionary(params.lang)

  return (
    <PageDrawer
      messages={messages.common}
      header={
        <button className="text-blue-500 active:text-blue-500/80">
          <Share />
        </button>
      }
    >
      <Suspense
        fallback={
          <div className="flex h-1/2 w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
            <Loader className="h-6 w-6 animate-spin" />
            <p>{messages.common.loading}</p>
          </div>
        }
      >
        <ShortcutAdd messages={messages} params={params} />
      </Suspense>
    </PageDrawer>
  )
}

export const runtime = 'edge'
