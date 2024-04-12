import Image from 'next/image'

import { fetchCollections } from '#/lib/actions'
import { cn } from '#/lib/utils'
import Link from '#/components/link'

type CollectionsProps = {}

export default async function Collections({}: CollectionsProps) {
  const collections = await fetchCollections()

  return (
    <section className="hidden-scrollbar flex snap-x snap-mandatory gap-x-3 overflow-x-auto overscroll-x-contain pb-5 px-safe-max-4 lg:gap-x-5 lg:px-0 lg:pb-10">
      {collections.map((item, index) => (
        <div
          className="box-content w-full flex-shrink-0 snap-center pb-10 pt-2.5 md:w-1/2 lg:w-[400px] lg:snap-start last:lg:pr-[calc(var(--container-inset)*2)]"
          key={item.id}
        >
          <Link
            className="group relative block transition-all lg:rounded-2xl
            lg:[box-shadow:2px_4px_12px_#00000014]
            lg:[transform:translateX(var(--container-inset))]
            lg:hover:[box-shadow:2px_4px_16px_#00000029]
            lg:hover:[transform:translateX(var(--container-inset))_scale3d(1.01,1.01,1.01)]
            "
            href={`/collection/${item.id}`}
          >
            <div className="pb-3 lg:absolute lg:p-7 lg:text-white">
              <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold">
                {item.title}
              </h3>
            </div>
            <Image
              className="aspect-[4/5] w-full rounded-2xl object-cover transition-all
              [box-shadow:2px_4px_12px_#00000014]
              group-hover:[box-shadow:2px_4px_16px_#00000029]
              group-hover:[transform:scale3d(1.01,1.01,1.01)]
              group-active:brightness-75
              lg:shadow-none
              lg:group-hover:transform-none
              lg:group-hover:shadow-none
              "
              src={item.image}
              alt={item.title}
              width={400}
              height={500}
              priority={index === 0}
            />
          </Link>
        </div>
      ))}
    </section>
  )
}
