import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink/15 border-t-clay-500" />
      </div>
    )
  }

  if (!session) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}
