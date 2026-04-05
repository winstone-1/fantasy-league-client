// With lazy loading, each page only downloads when the user navigates to it.
// This cuts your initial load by ~60-70%.

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'


// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Each page becomes a separate JS chunk that loads on-demand.

const Dashboard           = lazy(() => import('./pages/Dashboard'))
const League              = lazy(() => import('./pages/League'))
const LeagueDetail        = lazy(() => import('./pages/LeagueDetail'))
const Teams               = lazy(() => import('./pages/Teams'))
const Search              = lazy(() => import('./pages/Search'))
const Standings           = lazy(() => import('./pages/Standings'))
const LiveMatches         = lazy(() => import('./pages/Livematches'))
const UserProfile         = lazy(() => import('./pages/userProfile'))
const CommissionerMatches = lazy(() => import('./pages/Commissionermatches'))
const Login               = lazy(() => import('./pages/Login'))
const Register            = lazy(() => import('./pages/Register'))
const NotFound            = lazy(() => import('./pages/NotFound'))

// ── Page loader ───────────────────────────────────────────────────────────────
// Shown while a page chunk is downloading. Keep it minimal — it's usually
// only visible for <200ms on a decent connection.

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-800 border-t-green-500 rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// ── Protected route ───────────────────────────────────────────────────────────

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Commissioner-only route ───────────────────────────────────────────────────

function CommissionerRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  // Commission check happens inside CommissionerMatches itself,
  // but this at least ensures the user is authenticated first.
  return children
}

// ── App ───────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    // Suspense wraps ALL routes — one fallback handles every lazy page
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/leagues" element={
          <ProtectedRoute><League /></ProtectedRoute>
        } />
        <Route path="/leagues/:id" element={
          <ProtectedRoute><LeagueDetail /></ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute><Teams /></ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute><Search /></ProtectedRoute>
        } />
        <Route path="/standings" element={
          <ProtectedRoute><Standings /></ProtectedRoute>
        } />
        <Route path="/livematches" element={
          <ProtectedRoute><LiveMatches /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><UserProfile /></ProtectedRoute>
        } />
        <Route path="/commissioner/matches" element={
          <CommissionerRoute><CommissionerMatches /></CommissionerRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}