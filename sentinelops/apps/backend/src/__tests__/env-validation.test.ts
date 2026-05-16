import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'

describe('env validation', () => {
  it('exits with non-zero code when a required key is missing', () => {
    const result = spawnSync(
      process.execPath,
      [
        '-r',
        'ts-node/register',
        '-e',
        "delete process.env.SUPABASE_URL; require('./src/config/env')"
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SUPABASE_URL: '',
          TS_NODE_TRANSPILE_ONLY: '1'
        },
        stdio: 'pipe',
        timeout: 3000
      }
    )

    expect(result.status).not.toBe(0)
  })
})
