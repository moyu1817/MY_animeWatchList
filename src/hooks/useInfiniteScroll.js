import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(fetchNextPage, enabled) {
  const ref = useRef(null)
  const stable = useCallback(fetchNextPage, [fetchNextPage])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && enabled) stable()
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [stable, enabled])

  return ref
}
