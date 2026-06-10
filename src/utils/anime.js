export function dedupByMalId(items) {
  const seen = new Set()
  return items.filter(a => {
    if (seen.has(a.mal_id)) return false
    seen.add(a.mal_id)
    return true
  })
}
