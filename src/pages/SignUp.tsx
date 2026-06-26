import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleIcon from '../components/GoogleIcon'
import PasswordStrength, {
  passwordRequirementsMet,
} from '../components/PasswordStrength'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function validate() {
    const next: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2)
      next.fullName = 'Enter your full name.'
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!passwordRequirementsMet(password))
      next.password = '8+ characters, one capital letter, one number.'
    if (confirmPassword !== password)
      next.confirmPassword = 'Passwords don\u2019t match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return

    setLoading(true)

    // Duplicate-email detection — Supabase signUp doesn't throw a clean
    // error for existing+confirmed emails, so we check first.
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      setErrors((p) => ({
        ...p,
        email: 'An account already exists with this email.',
      }))
      setLoading(false)
      return
    }

    const { error } = await signUp(
      fullName.trim(),
      email.trim().toLowerCase(),
      password
    )
    setLoading(false)

    if (error) {
      setFormError(error)
      return
    }
    navigate('/check-inbox', { state: { email: email.trim().toLowerCase() } })
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setFormError(error)
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Create your account"
      subtitle="One profile. We handle the job search from here."
      footer={
        <>
          Already with us?{' '}
          <Link to="/sign-in" className="font-medium text-ink underline underline-offset-4">
            Sign in
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

      {formError && (
        <div className="mb-5 rounded-xl border border-clay-700/20 bg-clay-50 px-4 py-3 text-[13px] text-clay-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="label">Full name</label>
          <input
            className={`input-field ${errors.fullName ? 'input-error' : ''}`}
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rama Sai Kiran"
            autoComplete="name"
          />
          {errors.fullName && (
            <p className="mt-1.5 text-[12px] text-clay-700">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="label">Email address</label>
          <input
            className={`input-field ${errors.email ? 'input-error' : ''}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1.5 text-[12px] text-clay-700">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="label">Password</label>
          <input
            className={`input-field ${errors.password ? 'input-error' : ''}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
          <PasswordStrength password={password} />
          {errors.password && (
            <p className="mt-1.5 text-[12px] text-clay-700">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="label">Confirm password</label>
          <input
            className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-[12px] text-clay-700">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-[12px] leading-relaxed text-ink/40">
          By continuing you agree to the Opportunities Cell Terms and
          acknowledge the Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  )
}
