'use client'

import { useRef, useState } from 'react'
import { Messages } from '#/get-dictionary'
import { useClickAway, useInViewport } from 'ahooks'

import { cn } from '#/lib/utils'
import SearchBar from '#/components/ui/search-bar'

type HeaderProps = {
  messages: Messages
}

export function Header({ messages }: HeaderProps) {
  const [sticky, setSticky] = useState(false)
  const ref = useRef<React.ElementRef<'header'>>(null)
  const sentinelRef = useRef<React.ElementRef<'span'>>(null)

  const [inViewport] = useInViewport(sentinelRef, {
    threshold: 1,
  })

  useClickAway(
    () => {
      if (!sticky) return
      ;(document.activeElement as HTMLElement).blur()
    },
    ref,
    'touchstart',
  )

  return (
    <>
      <header
        ref={ref}
        className={cn(
          'group top-0 z-10 overflow-hidden border-b border-transparent bg-transparent pb-4 saturate-[180%] backdrop-blur-[20px] backdrop-filter transition-colors pt-safe-max-4 px-safe-max-4 md:sticky lg:pt-safe-max-4',
          {
            sticky,
            'border-neutral-100/80 bg-zinc-50/80 dark:border-neutral-800/80 dark:bg-zinc-950/80':
              sticky && inViewport !== undefined && !inViewport,
            'md:border-neutral-100/80 md:bg-zinc-50/80 md:dark:border-neutral-800/80 md:dark:bg-zinc-950/80':
              inViewport !== undefined && !inViewport,
          },
        )}
        data-sticky={sticky}
      >
        <SearchBar
          messages={messages.common}
          setSticky={setSticky}
          className="ml-auto md:max-w-sm"
        />
      </header>
      <span
        ref={sentinelRef}
        className="pointer-events-none absolute left-0 top-0 h-[69px] w-full"
      ></span>
    </>
  )
}
