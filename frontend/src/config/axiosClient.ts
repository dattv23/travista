import axios from 'axios'
import { env } from './env'

const axiosClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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