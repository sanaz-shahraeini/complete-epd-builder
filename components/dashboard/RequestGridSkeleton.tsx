import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RequestGridSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Filters Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Request Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              <Skeleton className="aspect-video rounded-lg mb-4" />

              <Skeleton className="h-5 w-3/4 mb-3" />

              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>

              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

