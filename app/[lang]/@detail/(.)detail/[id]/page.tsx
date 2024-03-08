import { getDictionary } from '#/get-dictionary'
import { Share } from 'lucide-react'

import ShortcutAdd, { ShortcutAddProps } from '#/components/ui/shortcut-add'
import PageDrawer from '#/components/ui/page-drawer'

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
      <ShortcutAdd messages={messages} params={params} />
    </PageDrawer>
  )
}
