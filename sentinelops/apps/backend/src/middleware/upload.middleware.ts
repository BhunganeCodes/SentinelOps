import path from 'path'
import multer from 'multer'

const allowedMimeTypes = new Set(['application/pdf', 'text/plain'])
const allowedExtensions = new Set(['.pdf', '.txt'])

const storage = multer.diskStorage({
  destination: '/tmp',
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9_-]/gi, '-')
      .toLowerCase()

    callback(null, `${Date.now()}-${safeBaseName}${extension}`)
  }
})

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()

    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      callback(null, true)
      return
    }

    const error = new Error('Only PDF and TXT files are supported') as Error & { statusCode: number }
    error.statusCode = 400
    callback(error)
  }
})
