import { describe, expect, it } from 'vitest'
import { cn } from '~/utils/cn'

describe('cn', () => {
  it('merges conditional classes', () => {
    const isHidden = false

    expect(cn('px-2', isHidden && 'hidden', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves conflicting tailwind utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
