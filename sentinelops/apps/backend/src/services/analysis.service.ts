import { supabase } from '../lib/supabase'

export async function analyzeDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('procurement_analysis')
    .insert({
      document_id: documentId,
      status: 'processing'
    })

  if (error) {
    throw new Error(`Failed to queue procurement analysis: ${error.message}`)
  }
}

export function triggerDocumentAnalysis(documentId: string): void {
  void analyzeDocument(documentId).catch((error: unknown) => {
    console.error('Background document analysis failed', error)
  })
}
