import { supabase } from './supabase'
import type { NavigateFunction } from 'react-router-dom'

// Where should a signed-in user land? Checked in this order:
// admin → needs onboarding → needs to pay → dashboard.
// Used right after any sign-in/auth-callback event. Landing.tsx has its own
// reactive version of this (driven by AuthContext state rather than a fresh
// one-shot query) — if you change the ordering here, check that one too.
//
// Throws on any failed lookup rather than treating a fetch error as "no
// profile" / "no subscription" — silently misrouting a paid, onboarded user
// back to onboarding (or a free user into a paywall loop) because of a
// transient network blip is worse than showing an error and letting them
// retry. Callers are expected to catch and show a friendly message.
export async function routePostAuth(userId: string, navigate: NavigateFunction) {
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('is_admin, user_type')
    .eq('id', userId)
    .maybeSingle()
  if (profileErr) throw new Error('Could not load your profile. Please try again.')

  if (profile?.is_admin) { navigate('/admin', { replace: true }); return }
  if (!profile?.user_type) { navigate('/onboarding', { replace: true }); return }

  const { data: sub, error: subErr } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .maybeSingle()
  if (subErr) throw new Error('Could not load your subscription. Please try again.')

  if (!sub) { navigate('/subscription', { replace: true }); return }

  navigate('/dashboard', { replace: true })
}
