import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/services'
import { Input, Button, Alert } from '../components/Form'
import '../styles/global.css'
import '../styles/components.css'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.login(formData.email, formData.password)
      const { token, refreshToken, user } = response.data
      
      console.log('Login response:', { token, user })

      login(user, token, refreshToken)

      // Redirect based on role
      if (user.role === 'TEACHER') {
        navigate('/teacher-dashboard')
      } else {
        navigate('/student-dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: 'var(--spacing-lg)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>📊</div>
          <h1 style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>ProgressIQ</h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0
          }}>Where Structured Learning Meets Smart Progress Analytics</p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            block
            style={{ marginBottom: 'var(--spacing-lg)' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--color-primary)' }}>Register here</a>
        </div>
      </div>
    </div>
  )
}
