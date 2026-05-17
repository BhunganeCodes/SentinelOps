import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY')
}

const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
})

export interface ProcurementAnalysis {
  suppliers: string[]
  suspicious_clauses: string[]
  compliance_risks: string[]
  anomaly_score: number
  summary: string
}

export async function analyzeProcurementDocument(
  documentText: string
): Promise<ProcurementAnalysis> {
  const prompt = `
Analyze the following procurement document and return ONLY valid JSON.

{
  "suppliers": ["supplier names"],
  "suspicious_clauses": ["suspicious clauses"],
  "compliance_risks": ["compliance risks"],
  "anomaly_score": 0,
  "summary": "short summary"
}

Document:
${documentText}
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  const cleaned = text
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim()

try {
  return JSON.parse(cleaned) as ProcurementAnalysis
} catch (error) {
  console.error('Failed to parse Gemini response:', text)
  throw new Error('Gemini returned invalid JSON')
}
}