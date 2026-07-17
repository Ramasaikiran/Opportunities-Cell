import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PasswordStrength, { passwordRequirementsMet } from '../components/PasswordStrength'

describe('passwordRequirementsMet', () => {
  it('rejects short passwords', () => {
    expect(passwordRequirementsMet('Ab1')).toBe(false)
  })
  it('rejects passwords with no uppercase', () => {
    expect(passwordRequirementsMet('abcdefg1')).toBe(false)
  })
  it('rejects passwords with no lowercase', () => {
    expect(passwordRequirementsMet('ABCDEFG1')).toBe(false)
  })
  it('rejects passwords with no digit', () => {
    expect(passwordRequirementsMet('Abcdefgh')).toBe(false)
  })
  it('accepts a password meeting all requirements', () => {
    expect(passwordRequirementsMet('Abcdefg1')).toBe(true)
  })
})

describe('<PasswordStrength />', () => {
  it('renders nothing for an empty password', () => {
    const { container } = render(<PasswordStrength password="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('labels a strong password as Excellent', () => {
    render(<PasswordStrength password="Abcdefgh1!2345" />)
    expect(screen.getByText(/Excellent/)).toBeInTheDocument()
  })

  it('labels a weak password as Weak', () => {
    render(<PasswordStrength password="a" />)
    expect(screen.getByText(/Weak/)).toBeInTheDocument()
  })
})
