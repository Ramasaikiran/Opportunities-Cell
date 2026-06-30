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
  const { loading, profileLoaded, session, profile } = useAuth()

  // Wait for auth bootstrap AND profile fetch to complete
  if (loading || !profileLoaded) return <Spinner />

  // No session at all → admin sign in
  if (!session) return <Navigate to="/admin/login" replace />

  // Session exists but profile is null (DB issue / new user) → admin sign in
  if (!profile) return <Navigate to="/admin/login" replace />

  // Authenticated but not admin → user dashboard
  if (!profile.is_admin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
