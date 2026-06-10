import { describe, it, expect } from 'vitest'
import { dedupByMalId } from './anime'

describe('dedupByMalId', () => {
  it('returns empty array for empty input', () => {
    expect(dedupByMalId([])).toEqual([])
  })

  it('removes duplicate mal_id entries, keeping first occurrence', () => {
    const items = [
      { mal_id: 1, title: 'A' },
      { mal_id: 2, title: 'B' },
      { mal_id: 1, title: 'A duplicate' },
    ]
    const result = dedupByMalId(items)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('A')
    expect(result[1].title).toBe('B')
  })

  it('filters out null and undefined items', () => {
    const items = [null, { mal_id: 1, title: 'A' }, undefined, { mal_id: 2, title: 'B' }]
    const result = dedupByMalId(items)
    expect(result).toHaveLength(2)
  })

  it('preserves order of first occurrences', () => {
    const items = [
      { mal_id: 3 }, { mal_id: 1 }, { mal_id: 2 }, { mal_id: 1 }, { mal_id: 3 },
    ]
    expect(dedupByMalId(items).map(a => a.mal_id)).toEqual([3, 1, 2])
  })

  it('returns all items when there are no duplicates', () => {
    const items = [{ mal_id: 1 }, { mal_id: 2 }, { mal_id: 3 }]
    expect(dedupByMalId(items)).toHaveLength(3)
  })
})
