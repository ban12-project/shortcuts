import { Skeleton } from './skeleton'

type AlbumListSkeletonProps = {
  num?: number
}

export default function AlbumListSkeleton({ num = 2 }: AlbumListSkeletonProps) {
  return (
    <>
      {[...Array(num)].map((_, index) => (
        <div className="mt-5" key={index}>
          <div className="mb-4 px-safe-max-4 lg:px-5">
            <div className="pb-2 pt-4">
              <Skeleton className="h-6" />
            </div>
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div className="flex h-32 gap-x-3 px-safe-max-4 lg:px-5">
            <Skeleton className="h-full w-full rounded-3xl" />
            <Skeleton className="h-full w-full rounded-3xl" />
          </div>
        </div>
      ))}
    </>
  )
}
