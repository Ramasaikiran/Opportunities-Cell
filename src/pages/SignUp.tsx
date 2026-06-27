import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleIcon from '../components/GoogleIcon'
import PasswordStrength, { passwordRequirementsMet } from '../components/PasswordStrength'
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
    if (!fullName.trim() || fullName.trim().length < 2) next.fullName = 'Enter your full name.'
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!passwordRequirementsMet(password)) next.password = '8+ chars, one uppercase, one number.'
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)

    const { data: existing } = await supabase
      .from('profiles').select('id')
      .eq('email', email.trim().toLowerCase()).maybeSingle()

    if (existing) {
      setErrors((p) => ({ ...p, email: 'An account already exists with this email.' }))
      setLoading(false)
      return
    }

    const { error } = await signUp(fullName.trim(), email.trim().toLowerCase(), password)
    setLoading(false)
    if (error) { setFormError(error); return }
    navigate('/check-inbox', { state: { email: email.trim().toLowerCase() } })
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setFormError(error); setGoogleLoading(false) }
  }

  const fieldStyle = (hasError: boolean) => ({
    ...{} as object,
    ...(hasError ? { borderColor: 'rgba(255,80,80,0.5)', boxShadow: '0 0 0 3px rgba(255,80,80,0.08)' } : {}),
  })

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Create account"
      subtitle="One profile. We handle the job search from here."
      footer={
        <>
          <span style={{ color: '#3D3D52' }}>Already with us? </span>
          <Link to="/sign-in" style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </>
      }
    >
      <button type="button" onClick={handleGoogle} disabled={googleLoading} className="btn-google">
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="divider"><span>OR</span></div>

      {formError && <div className="error-box">{formError}</div>}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Full name</label>
          <input className="input-field" style={fieldStyle(!!errors.fullName)}
            type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name" autoComplete="name" />
          {errors.fullName && <p style={{ marginTop: 6, fontSize: 12, color: '#FF8080' }}>{errors.fullName}</p>}
        </div>

        <div>
          <label className="label">Email address</label>
          <input className="input-field" style={fieldStyle(!!errors.email)}
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" />
          {errors.email && <p style={{ marginTop: 6, fontSize: 12, color: '#FF8080' }}>{errors.email}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <input className="input-field" style={fieldStyle(!!errors.password)}
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password" autoComplete="new-password" />
          <PasswordStrength password={password} />
          {errors.password && <p style={{ marginTop: 6, fontSize: 12, color: '#FF8080' }}>{errors.password}</p>}
        </div>

        <div>
          <label className="label">Confirm password</label>
          <input className="input-field" style={fieldStyle(!!errors.confirmPassword)}
            type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password" autoComplete="new-password" />
          {errors.confirmPassword && <p style={{ marginTop: 6, fontSize: 12, color: '#FF8080' }}>{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#3D3D52', lineHeight: 1.6 }}>
          By continuing you agree to Opportunities Cell Terms and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  )
}
