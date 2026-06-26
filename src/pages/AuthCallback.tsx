import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [state, setState] = useState<'verifying' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      // supabase-js (detectSessionInUrl: true) already parses the
      // magic-link / OAuth tokens from the URL on load. We just need
      // to wait for the session to land, then make sure a profile
      // exists before sending the user into onboarding.
      const { data, error } = await supabase.auth.getSession()

      if (cancelled) return

      if (error || !data.session) {
        setState('error')
        setMessage(
          'This link has expired or already been used. Request a new one to continue.'
        )
        return
      }

      const userId = data.session.user.id

      // Profile is normally created by the DB trigger on signup, but
      // we defensively upsert here so OAuth-only or edge-case users
      // are never left without one.
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, account_status')
        .eq('id', userId)
        .maybeSingle()

      if (!profile) {
        await supabase.from('profiles').upsert({
          id: userId,
          full_name:
            data.session.user.user_metadata?.full_name ??
            data.session.user.email?.split('@')[0] ??
            'New member',
          email: data.session.user.email,
          avatar_url: data.session.user.user_metadata?.avatar_url ?? null,
          account_status: 'active',
        })
      }

      navigate('/onboarding', { replace: true })
    }

    run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-sunset px-6">
      <div className="pointer-events-none absolute inset-0 bg-grain mix-blend-overlay" />
      <div className="glass-card relative z-10 w-full max-w-[420px] rounded-3xl p-10 text-center shadow-glass">
        {state === 'verifying' ? (
          <>
            <div className="mx-auto mb-6 h-9 w-9 animate-spin rounded-full border-2 border-ink/15 border-t-clay-500" />
            <h1 className="font-display text-[22px] font-light text-ink">
              Verifying your account
            </h1>
            <p className="mt-2 text-[14px] text-ink/55">
              One moment — almost in.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-[22px] font-light text-ink">
              Link no longer valid
            </h1>
            <p className="mt-2 text-[14px] text-ink/55">{message}</p>
            <a
              href="/sign-up"
              className="btn-primary mt-6 inline-flex items-center justify-center"
            >
              Back to sign up
            </a>
          </>
        )}
      </div>
    </div>
  )
}
