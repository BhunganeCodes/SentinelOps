import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ProcurementAnalysis {
  suppliers: string[]
  suspicious_clauses: string[]
  compliance_risks: string[]
  anomaly_score: number
  summary: string
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null

  buildPrompt(documentText: string): string {
    return [
      'Analyze the following procurement document and return ONLY valid JSON.',
      '',
      '{',
      '  "suppliers": ["supplier names"],',
      '  "suspicious_clauses": ["suspicious clauses"],',
      '  "compliance_risks": ["compliance risks"],',
      '  "anomaly_score": 0,',
      '  "summary": "short summary"',
      '}',
      '',
      'Document:',
      documentText,
    ].join('\n')
  }

  async analyzeDocument(text: string): Promise<ProcurementAnalysis> {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY')
      }
      this.genAI = new GoogleGenerativeAI(apiKey)
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    })

    const prompt = this.buildPrompt(text)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const raw = response.text()

    return this.parseResponse(raw)
  }

  parseResponse(raw: string): ProcurementAnalysis {
    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    try {
      return JSON.parse(cleaned) as ProcurementAnalysis
    } catch {
      console.error('Failed to parse Gemini response:', raw)
      throw new Error('Gemini returned invalid JSON')
    }
  }
}

let _instance: GeminiService | null = null

export async function analyzeProcurementDocument(
  documentText: string,
): Promise<ProcurementAnalysis> {
  if (!_instance) {
    _instance = new GeminiService()
  }
  return _instance.analyzeDocument(documentText)
}
