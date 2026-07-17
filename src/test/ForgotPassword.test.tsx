import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ForgotPassword from '../pages/ForgotPassword'
import * as AuthContext from '../contexts/AuthContext'

describe('<ForgotPassword />', () => {
  const requestPasswordReset = vi.fn()

  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    requestPasswordReset.mockReset()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      requestPasswordReset,
      verifyRecoveryOtp: vi.fn(),
    } as unknown as ReturnType<typeof AuthContext.useAuth>)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )
  }

  it('renders a styled email input using the app design system, not raw Tailwind classes', () => {
    renderPage()
    const input = screen.getByPlaceholderText('you@example.com')
    // Regression guard: this page previously used undefined classes
    // ("input-field", "label", "btn-primary") that rendered completely
    // unstyled. It must use the real oc-* classes defined in index.css.
    expect(input).toHaveClass('oc-input')
    expect(input).not.toHaveClass('input-field')
  })

  it('submits the trimmed, lowercased email to requestPasswordReset', async () => {
    requestPasswordReset.mockResolvedValue({ error: null })
    renderPage()

    const input = screen.getByPlaceholderText('you@example.com')
    fireEvent.change(input, { target: { value: '  Kiran@Example.com  ' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith('kiran@example.com')
    })
  })

  it('shows the returned error message on failure', async () => {
    requestPasswordReset.mockResolvedValue({ error: 'Something went wrong.' })
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))

    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument()
  })

  it('moves to the code-entry step after a successful send', async () => {
    requestPasswordReset.mockResolvedValue({ error: null })
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))

    expect(await screen.findByPlaceholderText('000000')).toBeInTheDocument()
  })
})
