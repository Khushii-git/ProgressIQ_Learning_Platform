import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PrivateRoute, RoleRoute } from './components/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'

// Styles
import './styles/global.css'
import './styles/components.css'
import './styles/layout.css'

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard'} /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard'} /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={user?.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard'} /> : <RegisterPage />} />
      
      <Route
        path="/teacher-dashboard"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="TEACHER">
              <TeacherDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/student-dashboard"
        element={
          <PrivateRoute>
            <RoleRoute requiredRole="STUDENT">
              <StudentDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
