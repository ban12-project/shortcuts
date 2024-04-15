import { useEffect, useRef, useState } from 'react'
import { Messages } from '#/get-dictionary'
import { Search } from 'lucide-react'

import { cn } from '#/lib/utils'

interface SearchBarProps
  extends React.ButtonHTMLAttributes<React.ElementRef<'form'>> {
  messages: Messages['common']
  setSticky: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SearchBar({
  messages,
  className,
  setSticky,
}: SearchBarProps) {
  const buttonRef = useRef<React.ElementRef<'button'>>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!buttonRef.current) return
    const { width, marginLeft } = window.getComputedStyle(buttonRef.current)

    setWidth(Number.parseFloat(width) + Number.parseFloat(marginLeft))
  }, [buttonRef])

  return (
    <form className={cn('flex h-9', className)}>
      <label className="flex h-full w-full items-center rounded-xl bg-gray-400 bg-opacity-20 p-2 transition-[background-color] active:bg-opacity-30 dark:bg-gray-500 dark:bg-opacity-20">
        <Search className="scale-75 opacity-60" />
        <input
          type="text"
          placeholder={messages.search}
          className="ml-1.5 w-full border-none bg-transparent outline-none"
          onFocus={() => setSticky(true)}
        />
      </label>
      <div
        className="w-0 opacity-0 transition-all duration-300 group-data-[sticky=true]:w-[var(--width)] group-data-[sticky=true]:opacity-100 md:hidden"
        style={{ '--width': width + 'px' } as React.CSSProperties}
      >
        <button
          className="ml-3 h-full whitespace-nowrap text-blue-500 transition-opacity hover:no-underline active:text-blue-500/80 active:opacity-50"
          type="button"
          ref={buttonRef}
          onClick={() => setSticky(false)}
        >
          {messages.cancel}
        </button>
      </div>
    </form>
  )
}
