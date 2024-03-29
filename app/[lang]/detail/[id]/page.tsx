import { getDictionary } from '#/get-dictionary'

import ShortcutAdd, { ShortcutAddProps } from '#/components/ui/shortcut-add'

export default async function ShortcutPage({
  params,
}: Omit<ShortcutAddProps, 'messages'>) {
  const messages = await getDictionary(params.lang)

  return (
    <main className="flex flex-col max-h-screen">
      <ShortcutAdd messages={messages} params={params} />
    </main>
  )
}

export const runtime = 'edge'
