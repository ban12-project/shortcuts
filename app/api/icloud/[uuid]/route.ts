export async function GET(
  request: Request,
  { params }: { params: { uuid: string } },
) {
  const res = await fetch(
    `https://www.icloud.com/shortcuts/api/records/${params.uuid}`,
  )

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const data = await res.json()

  return Response.json(data)
}

export const runtime = 'edge'
