import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'
import { useRateLimit } from '../hooks/useRateLimit'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { requestPasswordReset, verifyRecoveryOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { blocked, blockMessage, recordAttempt } = useRateLimit('oc_fp_rl')

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (blocked) { setError(blockMessage); return }
    setLoading(true)
    recordAttempt()
    const { error } = await requestPasswordReset(email.trim().toLowerCase())
    setLoading(false)
    if (error) { setError(error); return }
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
        <Link to="/sign-in" className="font-medium text-ink underline underline-offset-4">
          ← Back to sign in
        </Link>
      }
    >
      {!sent ? (
        <form onSubmit={handleSend} className="space-y-5">
          {(error || blockMessage) && (
            <div className="rounded-xl border border-clay-700/20 bg-clay-50 px-4 py-3 text-[13px] text-clay-700">
              {error || blockMessage}
            </div>
          )}
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
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || blocked} className="btn-primary">
            {loading ? 'Sending…' : blocked ? (blockMessage ?? 'Blocked') : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-clay-700/20 bg-clay-50 px-4 py-3 text-[13px] text-clay-700">
              {error}
            </div>
          )}
          <div>
            <label className="label">6-digit code</label>
            <input
              className="input-field"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.4em', fontWeight: 600 }}
            />
          </div>
          <button type="submit" disabled={loading || code.length !== 6} className="btn-primary">
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
