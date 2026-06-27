import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleIcon from '../components/GoogleIcon'
import { useAuth } from '../contexts/AuthContext'

export default function SignIn() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
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
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setError(error); setGoogleLoading(false) }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in"
      subtitle="Your applications kept moving while you were away."
      footer={
        <>
          <span style={{ color: '#3D3D52' }}>New here? </span>
          <Link to="/sign-up" style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>
            Create an account →
          </Link>
        </>
      }
    >
      <button type="button" onClick={handleGoogle} disabled={googleLoading} className="btn-google">
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="divider"><span>OR</span></div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="label">Email address</label>
          <input className="input-field" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" required />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: '#6C63FF', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <input className="input-field" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" autoComplete="current-password" required />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
