import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleIcon from '../components/GoogleIcon'
import { useAuth } from '../contexts/AuthContext'

export default function SignIn() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

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
    navigate('/dashboard')
  }

  async function handleGoogle() {
    setGLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setError(error); setGLoading(false) }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in"
      subtitle="Your applications kept moving while you were away."
      footer={
        <>
          Not signed up yet?{' '}
          <Link to="/sign-up" style={{ color: '#0f0f0f', fontWeight: 600, textDecoration: 'none', borderBottom: '1.5px solid #0f0f0f' }}>
            Get started free
          </Link>
        </>
      }
    >
      {/* Google — Primary */}
      <button type="button" onClick={handleGoogle} disabled={gLoading} style={{
        width: '100%', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
        color: '#fff', background: '#0f0f0f', border: 'none',
        borderRadius: 12, cursor: 'pointer', letterSpacing: '-0.01em',
        opacity: gLoading ? 0.6 : 1, transition: 'opacity 0.15s',
      }}>
        <GoogleIcon />
        {gLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="oc-divider" style={{ margin: '22px 0' }}><span>or email</span></div>

      {error && (
        <div className="oc-error" style={{ marginBottom: 16 }}>
          ⚠ {error}
          {error.includes('verify') && (
            <Link to="/check-inbox" style={{ display: 'block', marginTop: 6, color: '#dc2626', fontWeight: 600, textDecoration: 'underline' }}>
              Resend verification email →
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="oc-label">Email address</label>
          <input className="oc-input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" autoFocus />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <label className="oc-label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#6b6b6b', textDecoration: 'none', borderBottom: '1px solid #e5e5e5' }}>
              Forgot?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input className="oc-input" type={showPwd ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPwd(p => !p)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#b5b5b5', padding: 4,
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
          fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
          color: '#fff', background: '#0f0f0f', border: 'none',
          borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1, letterSpacing: '-0.01em',
          transition: 'opacity 0.15s',
        }}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthLayout>
  )
}
