import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute     from './components/AdminRoute'
import Landing        from './pages/Landing'
import AuthCallback   from './pages/AuthCallback'
import CheckInbox     from './pages/CheckInbox'
import Dashboard      from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding     from './pages/Onboarding'
import ResetPassword  from './pages/ResetPassword'
import SignIn         from './pages/SignIn'
import SignUp         from './pages/SignUp'
import Subscription   from './pages/Subscription'
import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminLogin          from './pages/admin/AdminLogin'
import AdminUsers          from './pages/admin/AdminUsers'
import AdminUserDetail     from './pages/admin/AdminUserDetail'
import AdminJobs           from './pages/admin/AdminJobs'
import AdminSubscriptions  from './pages/admin/AdminSubscriptions'
import AdminAnalytics      from './pages/admin/AdminAnalytics'
import AdminActivityLog    from './pages/admin/AdminActivityLog'

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<Landing />} />
      <Route path="/sign-up"         element={<SignUp />} />
      <Route path="/sign-in"         element={<SignIn />} />
      <Route path="/check-inbox"     element={<CheckInbox />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/auth/callback"   element={<AuthCallback />} />
      <Route path="/subscription"    element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/onboarding"      element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard"       element={<ProtectedRoute requireSub><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/login"     element={<AdminLogin />} />
      <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
      <Route path="/admin/jobs"      element={<AdminRoute><AdminJobs /></AdminRoute>} />
      <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
      <Route path="/admin/analytics"     element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/activity"      element={<AdminRoute><AdminActivityLog /></AdminRoute>} />
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  )
}
