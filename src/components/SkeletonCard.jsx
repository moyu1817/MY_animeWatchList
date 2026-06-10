export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-md overflow-hidden border border-zinc-800">
      <div className="w-full aspect-[3/4] animate-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 animate-shimmer rounded w-3/4" />
        <div className="h-3 animate-shimmer rounded w-1/2" />
        <div className="h-7 animate-shimmer rounded mt-2" />
      </div>
    </div>
  )
}
