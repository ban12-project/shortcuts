import { Skeleton } from '#/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="p-safe-max-4">
      <Skeleton className="h-9 w-1/3" />
      <div className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <div className="flex h-32">
          <Skeleton className="h-full w-[calc((100%-0.75rem)/2)] rounded-3xl" />
          <div className="ml-3 flex-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
        <div className="flex h-32">
          <Skeleton className="h-full w-[calc((100%-0.75rem)/2)] rounded-3xl" />
          <div className="ml-3 flex-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
