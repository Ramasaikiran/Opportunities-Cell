import { supabase } from './supabase'
import type { NavigateFunction } from 'react-router-dom'

// Where should a signed-in user land? Checked in this order:
// admin → needs onboarding → needs to pay → dashboard.
// Used right after any sign-in/auth-callback event. Landing.tsx has its own
// reactive version of this (driven by AuthContext state rather than a fresh
// one-shot query) — if you change the ordering here, check that one too.
export async function routePostAuth(userId: string, navigate: NavigateFunction) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, user_type')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.is_admin) { navigate('/admin', { replace: true }); return }
  if (!profile?.user_type) { navigate('/onboarding', { replace: true }); return }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString())
    .maybeSingle()

  if (!sub) { navigate('/subscription', { replace: true }); return }

  navigate('/dashboard', { replace: true })
}
