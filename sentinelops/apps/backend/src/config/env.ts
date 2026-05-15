const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'LOBSTER_TRAP_KEY',
] as const

type EnvKey = typeof required[number]

function validateEnv(): Record<EnvKey, string> {
  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(k => console.error(`   - ${k}`))
    console.error('\nAdd them to your .env file and restart the server.')
    process.exit(1)
  }

  return required.reduce((acc, key) => {
    acc[key] = process.env[key]!
    return acc
  }, {} as Record<EnvKey, string>)
}

export const env = validateEnv()
