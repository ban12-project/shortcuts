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
      <header className="sticky top-0 z-10 overflow-hidden bg-white/80 bg-opacity-80 py-4 saturate-[180%] backdrop-blur-[20px] backdrop-filter pt-safe-max-4 px-safe-max-4 dark:bg-black/80 dark:bg-opacity-80">
        <SearchBar messages={messages.common} className="ml-auto md:max-w-sm" />
      </header>
      <main className="pb-6 pt-2">
        <div className="hidden pb-14 pt-20 mx-safe-max-4 lg:mx-[var(--container-inset)] lg:flex lg:text-3xl lg:tracking-wide">
          <h1 className="text-5xl font-bold">{messages.title}</h1>
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
