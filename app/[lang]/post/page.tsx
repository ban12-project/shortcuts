import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import ShortcutPost from '#/components/ui/shortcut-post'

export default async function PostPage({
  params,
}: {
  params: { lang: Locale }
}) {
  const messages = await getDictionary(params.lang)

  return <ShortcutPost messages={messages} />
}

export const runtime = 'edge'
