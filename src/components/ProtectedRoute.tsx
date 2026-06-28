import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children:   ReactNode
  requireSub?: boolean
}

const Spinner = () => (
  <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid #f0f0f0', borderTopColor: '#0f0f0f',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export default function ProtectedRoute({ children, requireSub = false }: Props) {
  const { session, loading, subscription, profile } = useAuth()

  if (loading) return <Spinner />
  if (!session) return <Navigate to="/sign-in" replace />

  // Suspended account (payment expired) → force renewal
  if (profile?.account_status === 'suspended') {
    return <Navigate to="/subscription?reason=expired" replace />
  }

  // Dashboard requires active subscription
  if (requireSub && !subscription) {
    return <Navigate to="/subscription" replace />
  }

  return <>{children}</>
}
