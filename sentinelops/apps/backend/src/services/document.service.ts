import type { Express } from 'express'
import { supabase } from '../lib/supabase'

export type CreatedDocument = {
  id: string
  status: 'processing'
}

export async function createProcessingDocument(
  file: Express.Multer.File
): Promise<CreatedDocument> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      original_filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      file_path: file.path,
      status: 'processing'
    })
    .select('id,status')
    .single()

  if (error) {
    throw new Error(`Failed to create document: ${error.message}`)
  }

  if (!data?.id) {
    throw new Error('Failed to create document: missing document id')
  }

  return {
    id: String(data.id),
    status: 'processing'
  }
}
