import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'
import { useRateLimit } from '../hooks/useRateLimit'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { blocked, blockMessage, recordAttempt } = useRateLimit('oc_fp_rl')

  async function handleSubmit(e: FormEvent) {
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

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title={sent ? 'Check your email' : 'Forgot your password?'}
      subtitle={
        sent
          ? `If an account exists for ${email}, a reset link is on its way.`
          : 'Enter the email tied to your account and we\u2019ll send a secure reset link.'
      }
      footer={
        <Link to="/sign-in" className="font-medium text-ink underline underline-offset-4">
          ← Back to sign in
        </Link>
      }
    >
      {!sent && (
        <form onSubmit={handleSubmit} className="space-y-5">
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
            {loading ? 'Sending…' : blocked ? (blockMessage ?? 'Blocked') : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
