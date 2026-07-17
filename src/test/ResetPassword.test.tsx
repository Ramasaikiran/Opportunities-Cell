import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResetPassword from '../pages/ResetPassword'
import * as AuthContext from '../contexts/AuthContext'

describe('<ResetPassword />', () => {
  const updatePassword = vi.fn()

  beforeEach(() => {
    updatePassword.mockReset()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      updatePassword,
    } as unknown as ReturnType<typeof AuthContext.useAuth>)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    )
  }

  it('renders styled inputs using the app design system', () => {
    renderPage()
    const input = screen.getByPlaceholderText('Create a strong password')
    // Regression guard for the same undefined-class bug as ForgotPassword.
    expect(input).toHaveClass('oc-input')
    expect(input).not.toHaveClass('input-field')
  })

  it('blocks submit and shows an error when passwords do not meet requirements', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'weak' } })
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: 'weak' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/8\+ characters/i)).toBeInTheDocument()
    expect(updatePassword).not.toHaveBeenCalled()
  })

  it('blocks submit and shows an error when passwords do not match', async () => {
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'Abcdefg1' } })
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: 'Abcdefg2' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/don.t match/i)).toBeInTheDocument()
    expect(updatePassword).not.toHaveBeenCalled()
  })

  it('calls updatePassword with a valid, matching password', async () => {
    updatePassword.mockResolvedValue({ error: null })
    renderPage()
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'Abcdefg1' } })
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { target: { value: 'Abcdefg1' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => expect(updatePassword).toHaveBeenCalledWith('Abcdefg1'))
  })
})
