import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Landing     from './pages/Landing'
import Onboarding  from './pages/Onboarding'
import Dashboard   from './pages/Dashboard'
import PlanReveal  from './pages/PlanReveal'
import AdminPanel  from './pages/AdminPanel'
import ParentPortal from './pages/ParentPortal'
import ForgotPassword from './pages/ForgotPassword'

function PrivateRoute({ children }) {
  const { currentUser, userData } = useAuth()
  if (!currentUser) return <Navigate to="/" replace />
  if (!userData) return <div className="loading-screen"><div className="spinner" /></div>
  if (!userData.plan) return <Navigate to="/onboarding" replace />
  return children
}

function OnboardRoute({ children }) {
  const { currentUser, userData } = useAuth()
  if (currentUser && userData?.plan) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/"              element={<Landing />} />
      <Route path="/forgot"        element={<ForgotPassword />} />
      <Route path="/admin"         element={<AdminPanel />} />
      <Route path="/parent"        element={<ParentPortal />} />
      <Route path="/onboarding"    element={<OnboardRoute><Onboarding /></OnboardRoute>} />
      <Route path="/plan-reveal"   element={<PrivateRoute><PlanReveal /></PrivateRoute>} />
      <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  )
}
