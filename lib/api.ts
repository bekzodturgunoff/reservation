import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1',
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bronuz_token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['apikey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return config
})

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('bronuz_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
