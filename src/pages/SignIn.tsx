import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleIcon from '../components/GoogleIcon'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Smart routing after login — checks admin, subscription, onboarding
  async function routeAfterLogin() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, user_type, account_status')
      .eq('id', session.user.id)
      .maybeSingle()

    // Admin → admin panel immediately
    if (profile?.is_admin) { navigate('/admin', { replace: true }); return }

    // Suspended → renew
    if (profile?.account_status === 'suspended') { navigate('/subscription?reason=expired', { replace: true }); return }

    // Not onboarded → fill profile
    if (!profile?.user_type) { navigate('/onboarding', { replace: true }); return }

    // Check subscription
    const { data: sub } = await supabase.from('subscriptions')
      .select('id').eq('user_id', session.user.id)
      .eq('status', 'active').gt('ends_at', new Date().toISOString()).maybeSingle()

    navigate(sub ? '/dashboard' : '/subscription', { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await signIn(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error) {
      setError(error.toLowerCase().includes('email not confirmed')
        ? 'Please verify your email first. Check your inbox.'
        : 'Incorrect email or password. Try again.')
      return
    }
    await routeAfterLogin()
  }

  async function handleGoogle() {
    setGLoading(true)
    const { error } = await signInWithGoogle()
    // Google → redirects to /auth/callback → AuthCallback handles routing
    if (error) { setError(error); setGLoading(false) }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in"
      footer={<>Don't have an account?{' '}
        <Link to="/sign-up" style={{ color: '#0f0f0f', fontWeight: 600, textDecoration: 'none', borderBottom: '1.5px solid #0f0f0f' }}>
          Sign up
        </Link></>}
    >
      <button type="button" onClick={handleGoogle} disabled={gLoading} style={{
        width: '100%', height: 52, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 10, fontFamily: "'Inter',sans-serif",
        fontSize: 15, fontWeight: 600, color: '#fff', background: '#0f0f0f',
        border: 'none', borderRadius: 12, cursor: 'pointer', opacity: gLoading ? 0.6 : 1,
      }}>
        <GoogleIcon />
        {gLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="oc-divider" style={{ margin: '20px 0' }}><span>or</span></div>

      {error && <div className="oc-error">⚠ {error}</div>}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="oc-label">Email</label>
          <input className="oc-input" type="email" value={email} autoComplete="email"
            onChange={e => { setEmail(e.target.value); setError(null) }}
            placeholder="you@example.com" />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <label className="oc-label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: '#9b9b9b', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input className="oc-input" type={showPwd ? 'text' : 'password'}
              value={password} autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); setError(null) }}
              placeholder="Your password" style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPwd(p => !p)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#b5b5b5',
            }}>
              {showPwd
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', height: 50, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 600,
          color: '#fff', background: '#0f0f0f', border: 'none',
          borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthLayout>
  )
}
