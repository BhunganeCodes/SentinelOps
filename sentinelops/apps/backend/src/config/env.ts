import dotenv from 'dotenv'
import path from 'path'

// Load .env from apps/backend/.env
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
})

// Optional: verify that the key is loaded
console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY)