const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000'

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('intrivue_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {})
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}