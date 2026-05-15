import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execSync } from 'child_process'

describe('env validation', () => {
  it('exits with non-zero code when a required key is missing', () => {
    let exitCode = 0
    try {
      execSync('ts-node -e "delete process.env.SUPABASE_URL; require(\'./src/config/env\')"', {
        cwd: process.cwd(),
        env: { ...process.env, SUPABASE_URL: '' },
        stdio: 'pipe'
      })
    } catch (err: any) {
      exitCode = err.status
    }
    expect(exitCode).not.toBe(0)
  })
})
