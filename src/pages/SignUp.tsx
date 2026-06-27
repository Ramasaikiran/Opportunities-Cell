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
  const [fullName, setFullName]             = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPwd]    = useState('')
  const [errors, setErrors]                 = useState<Record<string, string>>({})
  const [loading, setLoading]               = useState(false)
  const [gLoading, setGLoading]             = useState(false)
  const [formError, setFormError]           = useState<string | null>(null)

  function validate() {
    const next: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) next.fullName = 'Enter your full name.'
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!passwordRequirementsMet(password)) next.password = '8+ chars, one uppercase letter, one number.'
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    const { data: existing } = await supabase.from('profiles').select('id')
      .eq('email', email.trim().toLowerCase()).maybeSingle()
    if (existing) {
      setErrors((p) => ({ ...p, email: 'An account already exists with this email.' }))
      setLoading(false); return
    }
    const { error } = await signUp(fullName.trim(), email.trim().toLowerCase(), password)
    setLoading(false)
    if (error) { setFormError(error); return }
    navigate('/check-inbox', { state: { email: email.trim().toLowerCase() } })
  }

  async function handleGoogle() {
    setGLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setFormError(error); setGLoading(false) }
  }

  return (
    <AuthLayout
      eyebrow="GET STARTED — FREE"
      title="Create your account"
      subtitle="One profile. Applications on autopilot from day one."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/sign-in" style={{ color: '#0f0f0f', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid #0f0f0f' }}>
            Sign in
          </Link>
        </>
      }
    >
      <button type="button" onClick={handleGoogle} disabled={gLoading} className="oc-btn-google">
        <GoogleIcon />
        {gLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="oc-divider"><span>or</span></div>

      {formError && <div className="oc-error">⚠ {formError}</div>}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="oc-label">Full name</label>
          <input className={`oc-input${errors.fullName ? ' error' : ''}`}
            type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rama Sai Kiran" autoComplete="name" />
          {errors.fullName && <p className="oc-field-error">↑ {errors.fullName}</p>}
        </div>

        <div>
          <label className="oc-label">Email address</label>
          <input className={`oc-input${errors.email ? ' error' : ''}`}
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" />
          {errors.email && <p className="oc-field-error">↑ {errors.email}</p>}
        </div>

        <div>
          <label className="oc-label">Password</label>
          <input className={`oc-input${errors.password ? ' error' : ''}`}
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password" autoComplete="new-password" />
          <PasswordStrength password={password} />
          {errors.password && <p className="oc-field-error">↑ {errors.password}</p>}
        </div>

        <div>
          <label className="oc-label">Confirm password</label>
          <input className={`oc-input${errors.confirmPassword ? ' error' : ''}`}
            type="password" value={confirmPassword}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="Re-enter your password" autoComplete="new-password" />
          {errors.confirmPassword && <p className="oc-field-error">↑ {errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="oc-btn-primary" style={{ marginTop: 4 }}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
    </AuthLayout>
  )
}
