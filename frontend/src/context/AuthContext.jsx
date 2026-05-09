import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('intrivue_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await apiFetch('/auth/me')
        setUser(data)
      } catch (err) {
        localStorage.removeItem('intrivue_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    localStorage.setItem('intrivue_token', data.token)

    setToken(data.token)
    setUser(data.user)

    return data.user
  }

  const logout = () => {
    localStorage.removeItem('intrivue_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)