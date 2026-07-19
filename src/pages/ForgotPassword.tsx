import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { requestPasswordReset, verifyRecoveryOtp } = useAuth()
  const [email, setEmail] = useState(() => sessionStorage.getItem('oc_fp_email') ?? '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(() => sessionStorage.getItem('oc_fp_sent') === '1')
  const [error, setError] = useState<string | null>(null)

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await requestPasswordReset(email.trim().toLowerCase())
    setLoading(false)
    if (error) { setError(error); return }
    sessionStorage.setItem('oc_fp_email', email.trim().toLowerCase())
    sessionStorage.setItem('oc_fp_sent', '1')
    setSent(true)
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (code.length !== 6) return
    setLoading(true)
    const { error } = await verifyRecoveryOtp(email.trim().toLowerCase(), code)
    setLoading(false)
    if (error) { setError(error); return }
    sessionStorage.removeItem('oc_fp_email')
    sessionStorage.removeItem('oc_fp_sent')
    navigate('/reset-password', { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? `Code sent to ${email}. Valid for 10 minutes.`
          : 'Enter your email. Get back in under a minute.'
      }
      footer={
        <Link to="/sign-in" style={{ color: '#6b6b6b', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
          ← Back to sign in
        </Link>
      }
    >
      {!sent ? (
        <form onSubmit={handleSend} >
          {error && (
            <div className="oc-error">
              {error}
            </div>
          )}
          <div>
            <label className="oc-label">Email address</label>
            <input
              className="oc-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="oc-btn-primary" style={{ marginTop: 20 }}>
            {loading ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} >
          {error && (
            <div className="oc-error">
              {error}
            </div>
          )}
          <div>
            <label className="oc-label">6-digit code</label>
            <input
              className="oc-input"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.4em', fontWeight: 600 }}
            />
          </div>
          <button type="submit" disabled={loading || code.length !== 6} className="oc-btn-primary" style={{ marginTop: 20 }}>
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
