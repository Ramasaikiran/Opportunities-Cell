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
      setError(
        error.toLowerCase().includes('email not confirmed')
          ? 'Please verify your email before signing in.'
          : 'Incorrect email or password.'
      )
      return
    }
    navigate('/onboarding')
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error)
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in"
      subtitle="Your applications kept moving while you were away."
      footer={
        <>
          New to Opportunities Cell?{' '}
          <Link to="/sign-up" className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="btn-google"
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="text-[12px] tracking-wide text-ink/40">OR</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-clay-700/20 bg-clay-50 px-4 py-3 text-[13px] text-clay-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label !mb-0">Password</label>
            <Link
              to="/forgot-password"
              className="mb-2 text-[12px] font-medium text-clay-600 hover:text-clay-700"
            >
              Forgot password?
            </Link>
          </div>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
