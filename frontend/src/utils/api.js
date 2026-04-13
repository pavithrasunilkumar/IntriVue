import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
})

// Attach token if stored
const token = localStorage.getItem('intrivue_token')
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

export default api
