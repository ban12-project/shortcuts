import Link from 'next/link'
import { Messages } from '#/get-dictionary'

import { Albums } from '#/app/[lang]/page'

import ShortcutsGallery from './shortcut-gallery'
import styles from './shortcut-gallery-list.module.css'

type ShortcutsGalleryListProps = {
  albums: Albums[]
  messages: Messages
}

export interface Shortcut {
  id: number
  title: string
}

export async function getShortcuts(id: number): Promise<Shortcut[]> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/albums/${id}/photos`,
  )
  if (!res.ok) {
    throw new Error('Failed to fetch shortcuts')
  }
  return res.json()
}

export default async function ShortcutsGalleryList({
  albums,
  messages,
}: ShortcutsGalleryListProps) {
  const top10 = albums.slice(0, 10)

  const galleries = await Promise.all(
    top10.map((item) => getShortcuts(item.id)),
  )

  return (
    <ul className={styles.list}>
      {top10.map((item, index) => (
        <li key={item.id} className="mt-5">
          <div className="mb-4 px-safe-max-4 lg:px-5">
            <div className="device-pixel-ratio-border flex items-center border-zinc-300 pt-3 dark:border-zinc-700">
              <h4 className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold">
                {item.title}
              </h4>
              <Link
                href={`/list/${item.id}`}
                className="ml-auto whitespace-nowrap text-blue-500 active:text-blue-500/80"
              >
                {messages['see-all']}
              </Link>
            </div>
            <p className="flex-1 text-gray-500/90">{item.title}</p>
          </div>
          <ShortcutsGallery shortcuts={galleries[index]} />
        </li>
      ))}
    </ul>
  )
}
