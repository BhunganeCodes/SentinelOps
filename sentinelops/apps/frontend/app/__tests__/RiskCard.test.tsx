import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskCard } from '../components/RiskCard'

describe('RiskCard', () => {
  it('renders the score and label', () => {
    render(<RiskCard score={42} label="Vendor risk" />)
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText('Vendor risk')).toBeDefined()
  })

  it('shows lock down alert when score > 80', () => {
    render(<RiskCard score={85} label="Critical risk" />)
    expect(screen.getByText(/Lockdown alert/i)).toBeDefined()
  })

  it('does not show lock down alert when score <= 80', () => {
    render(<RiskCard score={80} label="High risk" />)
    expect(screen.queryByText(/Lockdown alert/i)).toBeNull()
  })
})
