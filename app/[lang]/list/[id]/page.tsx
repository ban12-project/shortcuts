import { Metadata } from 'next'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import ShortcutCard from '#/components/ui/shortcut-card'
import { getShortcuts } from '#/components/ui/albums-list'

type ListPageProps = {
  params: { id: string; lang: Locale }
}

export default async function ListPage({ params }: ListPageProps) {
  const gallery = await getShortcuts(Number.parseInt(params.id))

  return (
    <main className="p-safe-max-4">
      <h2 className="text-3xl font-bold">Get Stuff Done</h2>
      <ul className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {gallery.map((item) => (
          <li key={item.id} className="flex h-32">
            <ShortcutCard
              /* style={{ '-tw-gradient-from': item.bgColorFrom, '--tw-gradient-to': item.bgColorTo } as React.CSSProperties} */
              className="w-[calc((100%-0.75rem)/2)] snap-start scroll-ms-safe-max-4"
              href={`/detail/${item.id}`}
              item={item}
              scroll={false}
            />
            <p className="ml-3 h-full overflow-hidden text-ellipsis leading-[25.6px] text-zinc-500/90">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A quas
              consectetur suscipit unde! Ut ipsam, explicabo eum tempora facere
              dicta tenetur, omnis neque maxime laboriosam officia reiciendis
              error consectetur possimus!
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  // const gallery = await getShortcuts(Number.parseInt(params.id))

  return {
    title: 'Get Stuff Done',
    description: 'Get Stuff Done',
  }
}

export const runtime = 'edge'
