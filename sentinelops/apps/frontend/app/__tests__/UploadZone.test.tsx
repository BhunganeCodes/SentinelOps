import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UploadZone } from '../components/UploadZone'

describe('UploadZone', () => {
  it('renders upload area with file type badges', () => {
    const onUpload = vi.fn()
    render(<UploadZone onUpload={onUpload} progress={0} status="idle" message={null} selectedFileName="No file selected" />)

    expect(screen.getByText('Drop procurement documents here')).toBeDefined()
    expect(screen.getByText('PDF')).toBeDefined()
    expect(screen.getByText('TXT')).toBeDefined()
  })

  it('shows progress indicator', () => {
    const onUpload = vi.fn()
    render(<UploadZone onUpload={onUpload} progress={50} status="uploading" message="Uploading..." selectedFileName="test.pdf" />)

    expect(screen.getByText('50%')).toBeDefined()
    expect(screen.getByText('test.pdf')).toBeDefined()
  })

  it('shows error message in error state', () => {
    const onUpload = vi.fn()
    render(<UploadZone onUpload={onUpload} progress={0} status="error" message="Only PDF and TXT files are supported." selectedFileName="No file selected" />)

    expect(screen.getByText('Only PDF and TXT files are supported.')).toBeDefined()
  })
})
