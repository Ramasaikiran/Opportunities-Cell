import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute    from './components/AdminRoute'
import AuthCallback  from './pages/AuthCallback'
import CheckInbox   from './pages/CheckInbox'
import Dashboard    from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding   from './pages/Onboarding'
import ResetPassword from './pages/ResetPassword'
import SignIn        from './pages/SignIn'
import SignUp        from './pages/SignUp'
import Subscription  from './pages/Subscription'
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminUserDetail  from './pages/admin/AdminUserDetail'
import AdminJobs        from './pages/admin/AdminJobs'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<Navigate to="/sign-up" replace />} />
      <Route path="/sign-up"        element={<SignUp />} />
      <Route path="/sign-in"        element={<SignIn />} />
      <Route path="/check-inbox"    element={<CheckInbox />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback"  element={<AuthCallback />} />

      {/* Protected — user */}
      <Route path="/onboarding"    element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subscription"  element={<ProtectedRoute><Subscription /></ProtectedRoute>} />

      {/* Protected — admin */}
      <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users"        element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/users/:id"    element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
      <Route path="/admin/jobs"         element={<AdminRoute><AdminJobs /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/sign-up" replace />} />
    </Routes>
  )
}
