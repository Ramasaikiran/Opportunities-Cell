import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RESEND_COOLDOWN = 45

export default function CheckInbox() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resendVerification } = useAuth()

  const initialEmail = (location.state as { email?: string })?.email ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [editing, setEditing] = useState(!initialEmail)
  const [cooldown, setCooldown] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!initialEmail) return
    if (cooldown === 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown, initialEmail])

  useEffect(() => {
    if (initialEmail) setCooldown(RESEND_COOLDOWN)
  }, [initialEmail])

  if (!initialEmail && !editing) {
    navigate('/sign-up')
    return null
  }

  async function handleResend() {
    if (cooldown > 0 || !email) return
    setStatus('sending')
    const { error } = await resendVerification(email)
    if (error) {
      setStatus('error')
      setErrorMsg(error)
      return
    }
    setStatus('sent')
    setCooldown(RESEND_COOLDOWN)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh-sunset px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grain mix-blend-overlay" />
      <div className="glass-card relative z-10 w-full max-w-[460px] rounded-3xl p-9 shadow-glass animate-rise sm:p-12">
        <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-clay-500/15">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E8552F"
            strokeWidth="1.6"
          >
            <path
              d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-center font-display text-[28px] font-light text-ink">
          Check your inbox
        </h1>

        {editing ? (
          <div className="mt-7">
            <label className="label">Email address</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
            <button
              className="btn-primary mt-5"
              onClick={() => {
                if (email) setEditing(false)
              }}
            >
              Send verification link
            </button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-ink/60">
              We&rsquo;ve sent a secure verification link to{' '}
              <span className="font-medium text-ink">{email}</span>. Click the
              link to activate your Opportunities Cell account.
            </p>

            {status === 'sent' && (
              <p className="mt-5 rounded-xl bg-sage/10 px-4 py-3 text-center text-[13px] text-sage">
                Verification email re-sent. Check your inbox (and spam folder).
              </p>
            )}
            {status === 'error' && (
              <p className="mt-5 rounded-xl bg-clay-50 px-4 py-3 text-center text-[13px] text-clay-700">
                {errorMsg}
              </p>
            )}

            <p className="mt-6 text-center text-[12px] text-ink/40">
              Links expire after 24 hours for your security.
            </p>

            <button
              onClick={handleResend}
              disabled={cooldown > 0 || status === 'sending'}
              className="btn-primary mt-6"
            >
              {status === 'sending'
                ? 'Sending…'
                : cooldown > 0
                ? `Resend link in ${cooldown}s`
                : 'Resend verification email'}
            </button>

            <button
              onClick={() => setEditing(true)}
              className="mt-3 w-full text-center text-[13px] font-medium text-ink/55 underline underline-offset-4 hover:text-ink"
            >
              Change email address
            </button>
          </>
        )}

        <p className="mt-8 text-center text-[13px] text-ink/40">
          Wrong account?{' '}
          <Link to="/sign-in" className="font-medium text-ink underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
