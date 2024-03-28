import Image from 'next/image'
import Link from '#/components/link'

import { Album } from '#/app/[lang]/page'

type AlbumsCardListProps = {
  albums: Album[]
}

export default function AlbumsCardList({ albums }: AlbumsCardListProps) {
  return (
    <section className="hidden-scrollbar -ml-3 flex snap-x snap-mandatory overflow-x-auto px-safe-max-4 lg:snap-none lg:px-5">
      {albums.map((item, index) => (
        <Link
          className="group w-full flex-none snap-center space-y-3 pl-3 md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
          key={item.id}
          href={`/albums/${item.id}`}
        >
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold">
            {item.title}
          </h3>
          <Image
            className="aspect-[2.28] rounded-2xl object-cover transition-[filter] group-active:brightness-75"
            src="https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=320&h=160&q=80"
            alt={item.title}
            width={658}
            height={288}
            priority={index === 0}
          />
        </Link>
      ))}
    </section>
  )
}
