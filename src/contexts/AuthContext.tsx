import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, type Profile, type Subscription } from '../lib/supabase'

interface AuthContextValue {
  session:       Session | null
  user:          User | null
  profile:       Profile | null
  subscription:  Subscription | null
  loading:       boolean
  profileLoaded: boolean          // ← true once fetchProfile has completed at least once
  isAdmin:       boolean
  signUp:               (fullName: string, email: string, password: string) => Promise<{ error: string | null }>
  signIn:               (email: string, password: string)                   => Promise<{ error: string | null }>
  signInWithGoogle:     ()                                                  => Promise<{ error: string | null }>
  resendVerification:   (email: string)                                     => Promise<{ error: string | null }>
  verifySignupOtp:      (email: string, token: string)                      => Promise<{ error: string | null }>
  requestPasswordReset: (email: string)                                     => Promise<{ error: string | null }>
  verifyRecoveryOtp:    (email: string, token: string)                      => Promise<{ error: string | null }>
  updatePassword:       (password: string)                                  => Promise<{ error: string | null }>
  signOut:        () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin

// Some Supabase Auth endpoints (e.g. reset-password) intentionally return an
// empty body on success. Older client versions/edge cases can surface that
// as a raw "Unexpected end of JSON input" parser error instead of a clean
// AuthError. Never show that raw text to a user — treat it as success-shaped
// and fall back to a safe generic message otherwise.
function safeErrorMessage(message: string | undefined, fallback: string) {
  if (!message) return fallback
  if (/unexpected end of json input|failed to execute 'json'/i.test(message)) return fallback
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,       setSession]       = useState<Session | null>(null)
  const [profile,       setProfile]       = useState<Profile | null>(null)
  const [subscription,  setSubscription]  = useState<Subscription | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)   // ← new

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('ends_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub) {
      const isExpired = sub.status === 'active' && sub.ends_at && new Date(sub.ends_at) < new Date()
      if (isExpired) {
        await supabase.from('subscriptions').update({ status: 'expired' }).eq('id', sub.id)
        await supabase.from('profiles').update({ account_status: 'suspended' }).eq('id', userId)
        setSubscription(null)
        setProfile(prev => prev ? { ...prev, account_status: 'suspended' } : null)
      } else if (sub.status === 'active') {
        setSubscription(sub)
      } else {
        setSubscription(null)
      }
    } else {
      setSubscription(null)
    }

    setProfileLoaded(true)   // ← always mark done, even on error/null
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfileLoaded(true)   // no user → nothing to load
      }
      setLoading(false)
    })

    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session?.user) {
        // Only block the UI with a fresh-fetch spinner for events that actually
        // change *who* is signed in. A routine TOKEN_REFRESHED (fires on tab
        // refocus — e.g. right after picking a file from the OS file picker)
        // must NOT reset profileLoaded, or every protected page remounts and
        // any in-progress local state (like a multi-step form) is wiped.
        if (event !== 'TOKEN_REFRESHED') {
          setProfileLoaded(false)
          fetchProfile(session.user.id)
        }
        if (event === 'SIGNED_IN') supabase.rpc('touch_last_login')
      } else {
        setProfile(null)
        setSubscription(null)
        setProfileLoaded(true)               // signed out → nothing to load
      }
    })
    return () => sub.unsubscribe()
  }, [])

  async function signUp(fullName: string, email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: `${SITE_URL}/auth/callback` },
      })
      return { error: error ? safeErrorMessage(error.message, 'Sign up failed. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? safeErrorMessage(error.message, 'Sign in failed. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${SITE_URL}/auth/callback` },
      })
      return { error: error ? safeErrorMessage(error.message, 'Google sign in failed. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function resendVerification(email: string) {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      return { error: error ? (error.message || 'Could not resend email. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function verifySignupOtp(email: string, token: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
      return { error: error ? (error.message || 'Invalid or expired code. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/auth/callback`,
      })
      return { error: error ? safeErrorMessage(error.message, 'Could not send reset email. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function verifyRecoveryOtp(email: string, token: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
      return { error: error ? (error.message || 'Invalid or expired code. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error: error ? (error.message || 'Could not update password. Please try again.') : null }
    } catch {
      return { error: 'Network error. Check your connection and try again.' }
    }
  }

  async function signOut() { await supabase.auth.signOut() }

  async function refreshProfile() {
    if (session?.user) await fetchProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, profile, subscription,
      loading, profileLoaded, isAdmin: profile?.is_admin ?? false,
      signUp, signIn, signInWithGoogle, resendVerification, verifySignupOtp,
      requestPasswordReset, verifyRecoveryOtp, updatePassword, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
