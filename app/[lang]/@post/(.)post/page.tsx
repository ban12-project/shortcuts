import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import ShortcutPost from '#/components/ui/shortcut-post'

export default async function PostPage(props: { params: { lang: Locale } }) {
  const messages = await getDictionary(props.params.lang)

  return <ShortcutPost messages={messages} drawer={true} />
}

export const runtime = 'edge'
