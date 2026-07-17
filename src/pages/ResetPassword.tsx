import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import PasswordStrength, {
  passwordRequirementsMet,
} from '../components/PasswordStrength'
import { useAuth } from '../contexts/AuthContext'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!passwordRequirementsMet(password)) {
      setError('8+ characters, one capital letter, one number.')
      return
    }
    if (password !== confirm) {
      setError('Passwords don\u2019t match.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)

    if (error) {
      setError(error)
      return
    }
    navigate('/sign-in', { state: { passwordReset: true } })
  }

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title="Set a new password"
      subtitle="Make it something only you'd know."
    >
      <form onSubmit={handleSubmit} >
        {error && (
          <div className="oc-error">
            {error}
          </div>
        )}
        <div>
          <label className="oc-label">New password</label>
          <input
            className="oc-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            autoFocus
          />
          <PasswordStrength password={password} />
        </div>
        <div>
          <label className="oc-label">Confirm new password</label>
          <input
            className="oc-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loading} className="oc-btn-primary" style={{ marginTop: 4 }}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
