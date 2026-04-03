import { Skeleton } from '@/components/common/Skeleton'

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#171717]">
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Skeleton className="h-10 w-40 rounded-full bg-black/8" />
          <Skeleton className="h-10 w-28 rounded-full bg-black/8" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[22rem] rounded-[36px] bg-black/8 sm:h-[28rem]" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-28 rounded-full bg-black/8" />
            <Skeleton className="h-12 w-full max-w-xl bg-black/8" />
            <Skeleton className="h-5 w-full max-w-lg bg-black/8" />
            <Skeleton className="h-5 w-full max-w-md bg-black/8" />
            <Skeleton className="h-12 w-44 rounded-full bg-black/8" />
          </div>
        </div>

        <div className="mt-12 flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-28 rounded-full bg-black/8" />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[4/5] rounded-[28px] bg-black/8" />
              <Skeleton className="h-4 w-4/5 bg-black/8" />
              <Skeleton className="h-3 w-2/3 bg-black/8" />
              <Skeleton className="h-10 rounded-full bg-black/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
