import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
})

const t = localStorage.getItem('intrivue_token')
if (t) api.defaults.headers.common['Authorization'] = `Bearer ${t}`

export const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000'

export default api
