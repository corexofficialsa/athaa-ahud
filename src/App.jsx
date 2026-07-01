import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
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
  const { currentUser, userData, refreshUserData } = useAuth()

  // If signed in but Firestore fetch failed, retry once after 2 seconds
  useEffect(() => {
    if (currentUser && !userData) {
      const t = setTimeout(refreshUserData, 2000)
      return () => clearTimeout(t)
    }
  }, [currentUser, userData])

  if (!currentUser) return <Navigate to="/" replace />
  if (!userData) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>Loading your profile…</p>
    </div>
  )
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

  // Show splash on first open. Runs in parallel with auth loading.
  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  // Auth still restoring session — show brown background matching safe areas
  if (loading) return <div style={{ height: '100%', background: 'var(--brown)' }} />

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
