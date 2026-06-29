import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Spinner = () => (
  <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%',
      border: '3px solid #f0f0f0', borderTopColor: '#0f0f0f',
      animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, session } = useAuth()

  // Wait while auth bootstraps OR session exists but profile not yet fetched
  if (loading || (session && !profile)) return <Spinner />

  if (!session) return <Navigate to="/sign-in" replace />
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
