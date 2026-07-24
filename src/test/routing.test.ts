import { describe, it, expect, vi, beforeEach } from 'vitest'
import { routePostAuth } from '../lib/routing'
import { supabase } from '../lib/supabase'

// FAILURE MODE 1: a transient network/RLS error on the post-login profile
// or subscription lookup used to be silently swallowed (only `data` was
// destructured, `error` was dropped) — an onboarded, paying user could get
// misrouted to /onboarding or /subscription just because a query blipped.
// It should now throw so the caller can show an error instead of
// silently misrouting a real user.
describe('routePostAuth', () => {
  const navigate = vi.fn()

  beforeEach(() => {
    navigate.mockReset()
  })

  function mockFrom(responses: Record<string, any>) {
    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      const response = responses[table]
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        gt: () => builder,
        maybeSingle: () => Promise.resolve(response),
      }
      return builder
    })
  }

  it('throws instead of misrouting when the profile lookup errors', async () => {
    mockFrom({
      profiles: { data: null, error: { message: 'network error' } },
    })

    await expect(routePostAuth('user-1', navigate)).rejects.toThrow()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('throws instead of misrouting when the subscription lookup errors', async () => {
    mockFrom({
      profiles: { data: { is_admin: false, user_type: 'student' }, error: null },
      subscriptions: { data: null, error: { message: 'network error' } },
    })

    await expect(routePostAuth('user-1', navigate)).rejects.toThrow()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('still routes normally when both lookups succeed', async () => {
    mockFrom({
      profiles: { data: { is_admin: false, user_type: 'student' }, error: null },
      subscriptions: { data: { id: 'sub-1' }, error: null },
    })

    await routePostAuth('user-1', navigate)
    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
})
