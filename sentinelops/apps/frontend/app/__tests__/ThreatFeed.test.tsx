import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThreatFeed } from '../components/ThreatFeed'
import type { ThreatEvent } from '../components/ThreatFeed'

describe('ThreatFeed', () => {
  it('renders "No threats detected" when events array is empty', () => {
    render(<ThreatFeed events={[]} />)
    expect(screen.getByText('No threats detected')).toBeDefined()
  })

  it('renders threat events when provided', () => {
    const events: ThreatEvent[] = [
      { id: '1', severity: 'critical', message: 'Injection blocked', source: 'Gov', when: '1m ago' },
      { id: '2', severity: 'high', message: 'Anomaly detected', source: 'AI', when: '5m ago' },
    ]
    render(<ThreatFeed events={events} />)
    expect(screen.getByText('Injection blocked')).toBeDefined()
    expect(screen.getByText('Anomaly detected')).toBeDefined()
    expect(screen.getByText('2 events')).toBeDefined()
  })
})
