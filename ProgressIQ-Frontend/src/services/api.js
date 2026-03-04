import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081/api'

// Main axios instance with credentials for authenticated requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
})

// Auth axios instance WITH credentials so HTTPOnly cookie gets set during login/register
const authAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // MUST be true so server can set HTTPOnly cookie
})

let refreshAttempted = false

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !refreshAttempted) {
      refreshAttempted = true
      try {
        const refreshToken = sessionStorage.getItem('refreshToken')
        if (refreshToken) {
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken
          }, {
            withCredentials: true
          })
          
          // Retry the original request with new token
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('refreshToken')
        window.location.href = '/login'
      } finally {
        refreshAttempted = false
      }
    } else if (error.response?.status === 401) {
      // Already attempted refresh, redirect to login
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
export { authAxiosInstance }
