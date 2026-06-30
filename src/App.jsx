import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import SplashScreen from './components/SplashScreen'

const Landing       = lazy(() => import('./pages/Landing'))
const Onboarding    = lazy(() => import('./pages/Onboarding'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const PlanReveal    = lazy(() => import('./pages/PlanReveal'))
const AdminPanel    = lazy(() => import('./pages/AdminPanel'))
const ParentPortal  = lazy(() => import('./pages/ParentPortal'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

function PageLoader() {
  return <div className="loading-screen"><div className="spinner" /></div>
}

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
  const [splash, setSplash] = useState(true)

  if (splash || loading) {
    return <SplashScreen onDone={() => setSplash(false)} />
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/forgot"      element={<ForgotPassword />} />
        <Route path="/admin"       element={<AdminPanel />} />
        <Route path="/parent"      element={<ParentPortal />} />
        <Route path="/onboarding"  element={<OnboardRoute><Onboarding /></OnboardRoute>} />
        <Route path="/plan-reveal" element={<PrivateRoute><PlanReveal /></PrivateRoute>} />
        <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
