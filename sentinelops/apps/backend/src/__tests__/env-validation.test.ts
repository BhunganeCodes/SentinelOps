import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import os from 'os'
import path from 'path'

describe('env validation', () => {
  it('exits with non-zero code when a required key is missing', () => {
    const result = spawnSync(
      process.execPath,
      [
        '-r',
        'ts-node/register',
        '-e',
        `require(${JSON.stringify(path.resolve('src/config/env.ts'))})`
      ],
      {
        cwd: os.tmpdir(),
        env: {
          SUPABASE_URL: '',
          SUPABASE_ANON_KEY: 'anon',
          SUPABASE_SERVICE_ROLE_KEY: 'service',
          GEMINI_API_KEY: 'gemini',
          LOBSTER_TRAP_KEY: 'lobster',
          TS_NODE_TRANSPILE_ONLY: '1'
        },
        stdio: 'pipe',
        timeout: 3000
      }
    )

    expect(result.status).not.toBe(0)
  })
})
