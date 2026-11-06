import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export function PageLoading({ cards = 3 }: { cards?: number }) {
  return (
    <div className="min-h-dvh">
      <div className="border-b border-line bg-canvas/80">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Skeleton className="h-10 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="hidden h-10 w-24 sm:block" />
            <Skeleton className="hidden h-10 w-28 sm:block" />
            <Skeleton className="size-11" />
          </div>
        </div>
      </div>
      <div className="container-page py-8 sm:py-10">
        <Skeleton className="h-9 w-64" />
        <SkeletonText lines={1} className="mt-3 max-w-md" />
        <Skeleton className="mt-6 h-40 w-full rounded-card" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: cards }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-card" />
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
      </div>
    </div>
  );
}
