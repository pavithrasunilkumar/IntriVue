import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Zap } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/login'} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-text text-base tracking-tight">
            Intri<span className="text-gold">Vue</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-bright">
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <User size={11} className="text-white" />
              </div>
              <span className="text-text-dim text-sm font-medium">{user.name}</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors">
              <LogOut size={14}/> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
