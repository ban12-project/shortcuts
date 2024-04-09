import { Messages } from '#/get-dictionary'

import { fetchAlbums } from '#/lib/actions'
import Link from '#/components/link'

import Album from './album'
import styles from './album-list.module.css'

type AlbumListProps = {
  messages: Messages
}

export default async function AlbumList({ messages }: AlbumListProps) {
  const albums = await fetchAlbums()

  return (
    <ul className={styles.list}>
      {albums.map((item) => (
        <li key={item.id} className="mt-5">
          <div className="mb-4 px-safe-max-4 lg:px-5">
            <div className="device-pixel-ratio-border flex items-center border-zinc-300 pt-3 dark:border-zinc-700">
              <h4 className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold">
                {item.title}
              </h4>
              <Link
                href={`/album/${item.id}`}
                className="ml-auto whitespace-nowrap text-blue-500 active:text-blue-500/80"
              >
                {messages['see-all']}
              </Link>
            </div>
            <p className="flex-1 text-gray-500/90">{item.description}</p>
          </div>
          <Album shortcuts={JSON.parse(item.shortcuts)} />
        </li>
      ))}
    </ul>
  )
}
