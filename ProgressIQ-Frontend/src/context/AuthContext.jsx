import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(null)

  useEffect(() => {
    // Restore user from sessionStorage on mount
    try {
      const storedUser = sessionStorage.getItem('user')
      const storedRefreshToken = sessionStorage.getItem('refreshToken')
      
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken)
      }
    } catch (e) {
      // If sessionStorage is corrupted, clear it
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('refreshToken')
    }
    setLoading(false)
  }, [])

  const login = (userData, token, refreshTokenValue) => {
    // Token is stored in HTTPOnly cookie automatically by backend
    // Store only user data and refresh token in sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData))
    if (refreshTokenValue) {
      sessionStorage.setItem('refreshToken', refreshTokenValue)
      setRefreshToken(refreshTokenValue)
    }
    setUser(userData)
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint with email to revoke refresh token
      const email = user?.email || sessionStorage.getItem('user')?.email
      if (email) {
        await axiosInstance.post(`/auth/logout?email=${email}`)
      }
    } catch (error) {
      console.warn('Logout API error:', error)
    }
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('refreshToken')
    setUser(null)
    setRefreshToken(null)
    window.location.href = '/login'
  }

  const refreshAccessToken = async () => {
    if (!refreshToken) return false
    try {
      const response = await axiosInstance.post('/auth/refresh', {
        refreshToken: refreshToken
      })
      // New token is set in HTTPOnly cookie, just return success
      return true
    } catch (error) {
      // Refresh token expired, need to login again
      logout()
      return false
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
