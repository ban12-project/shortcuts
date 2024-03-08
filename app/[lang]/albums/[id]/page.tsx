import { Metadata } from 'next'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import ShortcutsGalleryList, {
  getShortcuts,
} from '#/components/ui/shortcut-gallery-list'

type AlbumsPageProps = {
  params: { id: string; lang: Locale }
}

export default async function AlbumsPage({ params }: AlbumsPageProps) {
  const [messages, gallery] = await Promise.all([
    getDictionary(params.lang),
    getShortcuts(Number.parseInt(params.id)),
  ])

  return (
    <main className="space-y-4">
      <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold pt-safe-max-4 px-safe-max-4">
        实用的小组件快捷指令
      </h2>
      <ShortcutsGalleryList messages={messages} albums={gallery} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: AlbumsPageProps): Promise<Metadata> {
  return {
    title: '实用的小组件快捷指令',
    description: '实用的小组件快捷指令',
  }
}
