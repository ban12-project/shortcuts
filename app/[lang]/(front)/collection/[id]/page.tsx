import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import type { Collection } from '@prisma/client'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import AlbumList from '#/components/ui/album-list'

type CollectionsProps = {
  params: { id: string; lang: Locale }
}

export default async function Collections({ params }: CollectionsProps) {
  const db = getRequestContext().env.DB
  const [messages, collection] = await Promise.all([
    getDictionary(params.lang),
    db
      .prepare(
        `
      SELECT
        id,
        title,
        image,
        (
          SELECT
            json_group_array(json_object(
              'id', a.id,
              'title', a.title,
              'description', a.description,
              'shortcuts', (
                SELECT
                  json_group_array(json_object(
                    'id', s.id,
                    'name', s.name,
                    'description', s.description
                  ))
                FROM Shortcut s
                WHERE s.albumId = a.id
              )
            ))
          FROM Album a
          WHERE a.collectionId = c.id
        ) AS albums
      FROM Collection c
      WHERE c.id = ?
    `,
      )
      .bind(params.id)
      .first<Collection & { albums: string; shortcuts: string }>(),
  ])

  if (!collection) notFound()

  return (
    <main>
      <div className="container-full pb-5 pt-safe-max-4">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
          {collection.title}
        </h1>
      </div>
      <AlbumList messages={messages} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: CollectionsProps): Promise<Metadata> {
  const db = getRequestContext().env.DB
  const collection = await db
    .prepare(
      `
    SELECT
      id,
      title,
      image
    FROM Collection c
    WHERE c.id = ?
  `,
    )
    .bind(params.id)
    .first<Collection>()

  if (!collection) notFound()

  return {
    title: collection.title,
    description: collection.title,
  }
}

export const runtime = 'edge'
