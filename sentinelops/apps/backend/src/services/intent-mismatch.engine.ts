export type IntentComparison = {
  mismatch: boolean
  score: number
}

export class IntentMismatchEngine {
  compare(declared: string, detected: string): IntentComparison {
    const declaredWords = this.tokenize(declared)
    const detectedWords = this.tokenize(detected)

    if (declaredWords.length === 0 && detectedWords.length === 0) {
      return { mismatch: false, score: 0 }
    }

    if (declaredWords.length === 0 || detectedWords.length === 0) {
      return { mismatch: true, score: 100 }
    }

    const matchCount = declaredWords.filter((word) =>
      detectedWords.some((dw) => dw === word || dw.includes(word) || word.includes(dw)),
    ).length

    const overlap = matchCount / Math.max(declaredWords.length, detectedWords.length)
    const score = Math.round((1 - overlap) * 100)

    return {
      mismatch: score > 60,
      score,
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2)
  }
}
