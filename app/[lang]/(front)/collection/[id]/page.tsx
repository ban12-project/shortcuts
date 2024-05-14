import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import { getPrismaWithD1 } from '#/lib/prisma'
import AlbumList from '#/components/ui/album-list'
import ShortcutList from '#/components/ui/shortcut-list'

type CollectionsProps = {
  params: { id: string; lang: Locale }
}

export default async function Collections({ params }: CollectionsProps) {
  const prisma = getPrismaWithD1()

  const [messages, collection] = await Promise.all([
    getDictionary(params.lang),
    prisma.collection.findUnique({
      where: { id: Number.parseInt(params.id) },
      include: {
        albums: {
          include: {
            shortcuts: true,
          },
        },
        shortcuts: true,
      },
    }),
  ])

  if (!collection) notFound()

  return (
    <main>
      <div className="container-full pb-5 pt-safe-max-4">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
          {collection.title}
        </h1>
      </div>
      <AlbumList albums={collection.albums} messages={messages} />

      <div className="container-full">
        <ShortcutList shortcuts={collection.shortcuts} />
      </div>
    </main>
  )
}

export async function generateMetadata({
  params,
}: CollectionsProps): Promise<Metadata> {
  const prisma = getPrismaWithD1()
  const collection = await prisma.collection.findUnique({
    where: { id: Number.parseInt(params.id) },
  })

  if (!collection) notFound()

  return {
    title: collection.title,
    description: collection.title,
  }
}

export const runtime = 'edge'
