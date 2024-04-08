import { Skeleton } from './skeleton'

export default function collectionsSkeleton() {
  return (
    <div className="px-safe-max-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-3 aspect-[2.28] rounded-2xl" />
    </div>
  )
}
