import { Suspense } from 'react'
import { Metadata } from 'next'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'
import { Share2 } from 'lucide-react'

import AlbumList from '#/components/ui/album-list'
import AlbumListSkeleton from '#/components/ui/album-list-skeleton'
import Collections from '#/components/ui/collections'
import CollectionsSkeleton from '#/components/ui/collections-skeleton'
import ColorSchemeToggle from '#/components/ui/color-scheme-toggle'
import SearchBar from '#/components/ui/search-bar'
import Link from '#/components/link'

type HomePageProps = {
  params: { lang: Locale }
}

export default async function Home({ params }: HomePageProps) {
  const messages = await getDictionary(params.lang)

  return (
    <>
      <header className="sticky top-0 z-10 overflow-hidden bg-white/80 bg-opacity-80 py-3 saturate-[180%] backdrop-blur-[20px] backdrop-filter pt-safe-max-3 px-safe-max-4 dark:bg-black/80 dark:bg-opacity-80">
        <SearchBar messages={messages.common} className="ml-auto md:max-w-sm" />
      </header>
      <main className="pb-6">
        <div className="flex pb-6 pt-14 mx-safe-max-4 lg:mx-[var(--container-inset,0)] lg:pb-14 lg:pt-20 lg:text-3xl lg:tracking-wide">
          <h1 className="text-3xl text-[32px] font-bold lg:text-5xl">
            {messages.title}
          </h1>
        </div>
        <Suspense fallback={<CollectionsSkeleton />}>
          <Collections />
        </Suspense>
        <Suspense fallback={<AlbumListSkeleton />}>
          <AlbumList messages={messages} />
        </Suspense>
      </main>
      <footer className="container-full flex pb-safe-max-4 lg:pb-5">
        <Link href="/post" scroll={false}>
          <Share2 />
        </Link>

        <ColorSchemeToggle className="ml-auto" />
      </footer>
    </>
  )
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const messages = await getDictionary(params.lang)

  return {
    title: messages.title,
    description: messages.description,
  }
}

export const runtime = 'edge'
