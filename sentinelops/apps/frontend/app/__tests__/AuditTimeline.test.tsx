import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuditTimeline } from '../components/AuditTimeline'
import type { AuditLogEntry } from '../components/AuditTimeline'

describe('AuditTimeline', () => {
  it('renders empty state when no logs provided', () => {
    render(<AuditTimeline logs={[]} />)
    expect(screen.getByText(/No audit events have been recorded/i)).toBeDefined()
  })

  it('renders audit events with severity badges', () => {
    const logs: AuditLogEntry[] = [
      { id: '1', type: 'Upload', severity: 'info', message: 'File uploaded', when: '1m ago' },
      { id: '2', type: 'Warning', severity: 'high', message: 'Policy triggered', when: '5m ago' },
      { id: '3', type: 'Critical', severity: 'critical', message: 'Injection blocked', when: '10m ago' },
    ]
    render(<AuditTimeline logs={logs} />)

    expect(screen.getByText('Upload')).toBeDefined()
    expect(screen.getByText('Warning')).toBeDefined()
    expect(screen.getByText('Critical')).toBeDefined()
    expect(screen.getByText('File uploaded')).toBeDefined()
    expect(screen.getByText('Injection blocked')).toBeDefined()
  })
})
