import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AuthCallback from './pages/AuthCallback'
import CheckInbox from './pages/CheckInbox'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import ResetPassword from './pages/ResetPassword'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-up" replace />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/check-inbox" element={<CheckInbox />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/sign-up" replace />} />
    </Routes>
  )
}
