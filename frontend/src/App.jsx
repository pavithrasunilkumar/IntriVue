import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login       from './pages/Login'
import Signup      from './pages/Signup'
import Dashboard   from './pages/Dashboard'
import DomainSelect from './pages/DomainSelect'
import ResumeUpload from './pages/ResumeUpload'
import Interview   from './pages/Interview'
import Results     from './pages/Results'

function Loader() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin"/>
        <p className="text-muted text-sm font-mono">Loading…</p>
      </div>
    </div>
  )
}

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? children : <Navigate to="/login" replace />
}
function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"           element={<Navigate to="/login" replace />} />
        <Route path="/login"      element={<Public><Login /></Public>} />
        <Route path="/signup"     element={<Public><Signup /></Public>} />
        <Route path="/dashboard"  element={<Private><Dashboard /></Private>} />
        <Route path="/select-domain" element={<Private><DomainSelect /></Private>} />
        <Route path="/setup"      element={<Private><ResumeUpload /></Private>} />
        <Route path="/interview/:id" element={<Private><Interview /></Private>} />
        <Route path="/results/:id"   element={<Private><Results /></Private>} />
        <Route path="*"           element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
