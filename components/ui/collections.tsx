import Image from 'next/image'

import { fetchCollections } from '#/lib/actions'
import Link from '#/components/link'

type CollectionsProps = {}

export default async function Collections({}: CollectionsProps) {
  const collections = await fetchCollections()

  return (
    <section className="hidden-scrollbar -ml-3 flex snap-x snap-mandatory overflow-x-auto px-safe-max-4 lg:snap-none lg:px-5">
      {collections.map((item, index) => (
        <Link
          className="group w-full flex-none snap-center space-y-3 pl-3 md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
          key={item.id}
          href={`/collection/${item.id}`}
        >
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold">
            {item.title}
          </h3>
          <Image
            className="aspect-[2.28] rounded-2xl object-cover transition-[filter] group-active:brightness-75"
            src={item.image}
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
