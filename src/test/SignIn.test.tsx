import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignIn from '../pages/SignIn'
import * as AuthContext from '../contexts/AuthContext'
import * as routing from '../lib/routing'
import { supabase } from '../lib/supabase'

// FAILURE MODE 2: signIn() could succeed (valid credentials) while the
// follow-up routing step (routePostAuth, fetching profile/subscription)
// fails. Previously this was unhandled — the button re-enabled with no
// error and no navigation, leaving the user stuck with zero feedback.
describe('<SignIn /> post-login routing failure', () => {
  const signIn = vi.fn()

  beforeEach(() => {
    signIn.mockReset()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      signIn,
      signInWithGoogle: vi.fn(),
    } as unknown as ReturnType<typeof AuthContext.useAuth>)
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } as any },
      error: null,
    } as any)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    )
  }

  it('shows a friendly error and re-enables the button when routing after login fails', async () => {
    signIn.mockResolvedValue({ error: null })
    vi.spyOn(routing, 'routePostAuth').mockRejectedValue(new Error('Could not load your profile.'))

    renderPage()
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'Password1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // Never a raw thrown error object rendered to the user.
    await waitFor(() => {
      expect(screen.getByText(/could not load your account/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()

    const button = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement
    expect(button.disabled).toBe(false)
  })

  it('shows an error if the session never materializes after a successful sign-in', async () => {
    signIn.mockResolvedValue({ error: null })
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: null }, error: null } as any)

    renderPage()
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'Password1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/session did not load/i)).toBeInTheDocument()
    })
  })
})
