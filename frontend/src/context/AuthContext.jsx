import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(localStorage.getItem('intrivue_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem('intrivue_token'); setToken(null) })
        .finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [token])

  const _persist = (t, u) => {
    localStorage.setItem('intrivue_token', t)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
  }

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    _persist(r.data.token, r.data.user)
    return r.data.user
  }

  const logout = () => {
    localStorage.removeItem('intrivue_token')
    delete api.defaults.headers.common['Authorization']
    setToken(null); setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
