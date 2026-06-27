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
        ? 'Please verify your email before signing in.'
        : 'Incorrect email or password.')
      return
    }
    navigate('/onboarding')
  }

  async function handleGoogle() {
    setGLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setError(error); setGLoading(false) }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to your account"
      subtitle="Pick up right where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/sign-up" style={{ color: '#0f0f0f', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #0f0f0f' }}>
            Create an account
          </Link>
        </>
      }
    >
      <button type="button" onClick={handleGoogle} disabled={gLoading} className="oc-btn-google">
        <GoogleIcon />
        {gLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="oc-divider"><span>or</span></div>

      {error && <div className="oc-error">⚠ {error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="oc-label">Email address</label>
          <input className="oc-input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" required />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <label className="oc-label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#6b6b6b', textDecoration: 'none', borderBottom: '1px solid #e5e5e5' }}>
              Forgot password?
            </Link>
          </div>
          <input className="oc-input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete="current-password" required />
        </div>

        <button type="submit" disabled={loading} className="oc-btn-primary" style={{ marginTop: 4 }}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthLayout>
  )
}
