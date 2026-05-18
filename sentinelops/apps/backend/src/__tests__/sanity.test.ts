import { describe, expect, it } from 'vitest'

describe('backend test runner sanity', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('has access to vitest globals', () => {
    expect(typeof describe).toBe('function')
  })
})
