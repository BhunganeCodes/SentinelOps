type ThresholdEntry = {
  threshold: number
  callback: (score: number) => void
  fired: boolean
}

export class RiskScorer {
  private score = 0
  private thresholds: ThresholdEntry[] = []

  add(delta: number): number {
    this.score = Math.min(100, Math.max(0, this.score + delta))
    this.checkThresholds()
    return this.score
  }

  getScore(): number {
    return this.score
  }

  reset(): void {
    this.score = 0
  }

  onThreshold(threshold: number, callback: (score: number) => void): void {
    this.thresholds.push({ threshold, callback, fired: false })
  }

  private checkThresholds(): void {
    for (const entry of this.thresholds) {
      if (!entry.fired && this.score >= entry.threshold) {
        entry.fired = true
        entry.callback(this.score)
      }
    }
  }
}
