import { Metadata } from 'next'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'
import { Share2 } from 'lucide-react'

import AlbumsGallery from '#/components/ui/albums-gallery'
import ColorSchemeToggle from '#/components/ui/color-scheme-toggle'
import SearchBar from '#/components/ui/search-bar'
import ShortcutsGalleryList from '#/components/ui/shortcut-gallery-list'
import { Link } from '#/components/link'

type HomePageProps = {
  params: { lang: Locale }
}

export interface Albums {
  id: number
  title: string
}

async function getAlbums(): Promise<Albums[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/albums')
  if (!res.ok) {
    throw new Error('Failed to fetch albums')
  }
  return res.json()
}

export default async function Home({ params }: HomePageProps) {
  const messages = await getDictionary(params.lang)
  const albums = await getAlbums()

  return (
    <>
      <header className="sticky top-0 z-10 overflow-hidden bg-white/80 bg-opacity-80 py-4 saturate-[180%] backdrop-blur-[20px] backdrop-filter pt-safe-max-4 px-safe-max-4 dark:bg-black/80 dark:bg-opacity-80">
        <SearchBar messages={messages.common} className="ml-auto md:max-w-sm" />
      </header>
      <main className="mb-6 mt-2">
        <AlbumsGallery albums={albums} />
        <ShortcutsGalleryList messages={messages} albums={albums} />
      </main>
      <footer className="mx-auto pb-safe-max-4 px-safe-max-4 lg:px-5 lg:pb-5 flex">
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
