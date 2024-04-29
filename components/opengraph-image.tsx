import { ImageResponse } from 'next/og'

type Props = {
  title?: string
}

export default async function Image(props?: Props) {
  const { title } = { ...{ title: process.env.SITE_NAME }, ...props }

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col items-center justify-center bg-white">
        <div
          tw="flex flex-none items-center justify-center border border-orange-500 h-[160px] w-[160px] rounded-3xl"
          style={{
            borderWidth: '6px',
            transform: 'rotate(36deg)',
          }}
        ></div>
        <p tw="mt-12 text-6xl font-bold capitalize">{title}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await fetch(
            new URL('../fonts/Inter-Bold.ttf', import.meta.url),
          ).then((res) => res.arrayBuffer()),
          style: 'normal',
          weight: 700,
        },
      ],
    },
  )
}
