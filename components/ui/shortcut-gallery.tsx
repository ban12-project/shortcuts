'use client'

import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useSize } from 'ahooks'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

import { useResponsive } from '#/hooks/use-responsive'

import ShortcutCard from './shortcut-card'
import { Shortcut } from './shortcut-gallery-list'

type ShortcutsGalleryProps = {
  shortcuts: Shortcut[]
}

let PADDING_LEFT: number,
  PADDING_RIGHT: number,
  ITEM_COUNT: number,
  GAP_SIZE = 12

const outerElementType = forwardRef<React.ElementRef<'div'>>(
  function Outer(props, ref) {
    return <div ref={ref} {...props} className="hidden-scrollbar"></div>
  },
)

const innerElementType = forwardRef<
  React.ElementRef<'div'>,
  { style: React.CSSProperties }
>(function Inner({ style, ...rest }, ref) {
  return (
    <div
      ref={ref}
      style={{
        ...style,
        width: `${
          Number.parseFloat(style.width as string) +
          PADDING_LEFT +
          PADDING_RIGHT -
          GAP_SIZE
        }px`,
      }}
      {...rest}
    ></div>
  )
})

const Column: React.ComponentType<ListChildComponentProps<Shortcut[]>> = ({
  index,
  style,
  data,
}) => (
  <ShortcutCard
    style={{
      ...style,
      left: `${Number.parseFloat(style.left as string) + PADDING_LEFT}px`,
      width: `${Number.parseFloat(style.width as string) - GAP_SIZE}px`,
    }}
    item={data[index]}
    href={`/detail/${data[index].id}`}
    scroll={false}
  />
)

export default function ShortcutsGallery({ shortcuts }: ShortcutsGalleryProps) {
  const ref = useRef<React.ElementRef<'div'>>(null)
  const size = useSize(ref)

  ITEM_COUNT = shortcuts.length
  const anchorRef = useRef<React.ElementRef<'div'>>(null)
  const update = () => {
    if (!anchorRef.current) return
    const { paddingLeft, paddingRight } = window.getComputedStyle(
      anchorRef.current,
    )
    PADDING_LEFT = Number.parseFloat(paddingLeft)
    PADDING_RIGHT = Number.parseFloat(paddingRight)
  }

  useEffect(update, [anchorRef])
  useEffect(() => {
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
    }
  }, [])

  const breakpoints = useResponsive()

  const columnNumber = useMemo(() => {
    if (breakpoints['2xl']) return 10
    if (breakpoints.xl) return 8
    if (breakpoints.lg) return 6
    if (breakpoints.md) return 4
    return 2
  }, [breakpoints])

  return (
    <>
      <div className="absolute px-safe-max-4 lg:px-5" ref={anchorRef}></div>
      <div className="h-32" ref={ref}>
        {size && (
          <FixedSizeList
            itemSize={
              (size.width - PADDING_LEFT - PADDING_RIGHT) / columnNumber +
              GAP_SIZE / columnNumber
            }
            width={size.width}
            height={size.height}
            itemCount={ITEM_COUNT}
            itemData={shortcuts}
            outerElementType={outerElementType}
            innerElementType={innerElementType}
            layout="horizontal"
          >
            {Column}
          </FixedSizeList>
        )}
      </div>
    </>
  )
  /* <section className="hidden-scrollbar flex h-32 w-full snap-x snap-mandatory gap-3 overflow-x-auto px-safe-max-4 md:snap-none">
    {shortcuts.map((item) => (
      <ShortcutCard
        key={item.id}
        item={item}
        className="w-[calc((100%-0.75rem)/2)] snap-start scroll-ms-safe-max-4"
        href={`/detail/${item.id}`}
        scroll={false}
      />
    ))}
  </section> */
}
