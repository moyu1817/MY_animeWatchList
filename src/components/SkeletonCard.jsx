export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-md overflow-hidden border border-zinc-800 animate-pulse">
      <div className="w-full aspect-[3/4] bg-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
        <div className="h-7 bg-zinc-800 rounded mt-2" />
      </div>
    </div>
  )
}
