import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthCallback from '../pages/AuthCallback'
import * as routing from '../lib/routing'
import { supabase } from '../lib/supabase'

// FAILURE MODE 3: after a Google/magic-link redirect, any failure in the
// profile-fetch / profile-upsert / routing chain (e.g. a network blip, a
// blocked request, an RLS error) was unhandled — the component stayed on
// "Verifying your account" forever with the spinner still running,
// silently. There was no way for the user to know anything had gone
// wrong or to get out of it. It must now show the error screen with a
// safe, user-facing message.
describe('<AuthCallback /> failure handling', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthCallback />
      </MemoryRouter>
    )
  }

  it('shows the error screen (not an infinite spinner) when the profile fetch fails', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'a@b.com', user_metadata: {} } } as any },
      error: null,
    } as any)
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'network error' } }),
      }
      return builder
    })

    renderPage()

    expect(screen.getByText(/verifying your account/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/we hit a snag/i)).toBeInTheDocument()
    })
    // Never leak the raw driver/error object to the user.
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument()
    expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
    expect(screen.getByText(/contact support@applymate\.in/i)).toBeInTheDocument()
  })

  it('shows the error screen when routePostAuth itself throws', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'a@b.com', user_metadata: {} } } as any },
      error: null,
    } as any)
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: () => Promise.resolve({ data: { id: 'user-1', user_type: 'student', is_admin: false }, error: null }),
      }
      return builder
    })
    vi.spyOn(routing, 'routePostAuth').mockRejectedValue(new Error('boom'))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/we hit a snag/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /back to sign up/i })).toBeInTheDocument()
  })
})
