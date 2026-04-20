import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User } from 'lucide-react'

const GradText = ({ children }) => (
  <span style={{
    background: 'linear-gradient(90deg,#7c3aed,#6366f1,#06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.55))'
  }}>{children}</span>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/login'} className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="IntriVue" className="w-8 h-8"/>
          <span className="font-bold text-[15px] tracking-tight text-text">
            Intri<GradText>Vue</GradText>
          </span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass-bright rounded-xl">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet to-indigo flex items-center justify-center">
                <User size={10} className="text-white"/>
              </div>
              <span className="text-dim text-sm font-medium">{user.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-1.5 text-sub text-sm hover:text-text transition-colors px-2 py-1.5">
              <LogOut size={14}/><span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
