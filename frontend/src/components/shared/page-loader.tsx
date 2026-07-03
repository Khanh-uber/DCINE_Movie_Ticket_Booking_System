import { Skeleton } from '@/components/ui/skeleton'

export function PageLoader() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
