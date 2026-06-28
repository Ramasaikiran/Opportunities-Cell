import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Inter,sans-serif',color:'#9b9b9b',fontSize:14 }}>Loading…</div>
  if (!profile) return <Navigate to="/sign-in" replace />
  if (!profile.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
