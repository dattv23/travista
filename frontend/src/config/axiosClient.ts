import axios from 'axios'
import { env } from './env'

// Get API URL and ensure it doesn't end with /api (since routes already include /api)
let apiUrl = env.API_URL || 'http://localhost:8080'

// Remove trailing slash
apiUrl = apiUrl.replace(/\/$/, '')

// Warn if API_URL includes /api - routes already have /api prefix
if (apiUrl.includes('/api')) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL should not include /api - routes already have /api prefix')
  // Optionally remove /api from the end
  apiUrl = apiUrl.replace(/\/api\/?$/, '')
}

// Validate API URL is set
if (!apiUrl) {
  console.error('⚠️ NEXT_PUBLIC_API_URL is not set in environment variables')
  apiUrl = 'http://localhost:8080' // dev
}

const axiosClient = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})


if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 Axios Client Base URL:', axiosClient.defaults.baseURL)
}

axiosClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - redirecting to login')
    }
    return Promise.reject(error)
  },
)

export default axiosClient
