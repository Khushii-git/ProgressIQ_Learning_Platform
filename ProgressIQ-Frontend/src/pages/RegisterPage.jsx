import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/services'
import { Input, Button, Alert, Select } from '../components/Form'
import '../styles/global.css'
import '../styles/components.css'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    teacherId: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [teachersError, setTeachersError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true)
        const response = await authService.getTeachers()
        if (isMounted) {
          setTeachers(response.data || [])
          setTeachersError('')
        }
      } catch (err) {
        console.error('Failed to fetch teachers', err)
        if (isMounted) {
          setTeachersError('Unable to load teachers. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setTeachersLoading(false)
        }
      }
    }

    fetchTeachers()
    return () => { isMounted = false }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        role: value,
        teacherId: value === 'STUDENT' ? prev.teacherId : ''
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.role === 'STUDENT' && !formData.teacherId) {
      setError('Please select a teacher')
      return
    }

    setLoading(true)

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        teacherId: formData.role === 'STUDENT' ? (formData.teacherId ? Number(formData.teacherId) : null) : null
      }
      console.log('Sending registration:', registerData)
      await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.role === 'STUDENT' ? Number(formData.teacherId) : null
      )

      navigate('/login', { state: { message: 'Registration successful! Please login.' } })
    } catch (err) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response?.data)
      let errorMsg = 'Registration failed. Please try again.'
      
      if (err.response?.status === 403) {
        errorMsg = 'Access denied. Please ensure you have provided all required information.'
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.message || 'Invalid registration data. Please check your inputs.'
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (typeof err.response?.data === 'string') {
        errorMsg = err.response.data
      } else if (err.message) {
        errorMsg = err.message
      }
      
      setError(errorMsg)
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
        maxWidth: '450px'
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
          }}>Create Account</h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0
          }}>Join ProgressIQ Today</p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'STUDENT', label: 'Student' },
              { value: 'TEACHER', label: 'Teacher' }
            ]}
          />

          {formData.role === 'STUDENT' && (
            <div>
              <Select
                label="Assign Teacher"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                required
                options={(teachers || []).map(t => ({
                  value: t.id,
                  label: `${t.username} (${t.email})`
                }))}
                placeholder={teachersLoading ? 'Loading teachers...' : ((teachers || []).length ? 'Select teacher' : 'No teachers available')}
                disabled={teachersLoading || (teachers || []).length === 0}
              />
              {teachersError && (
                <p style={{ color: 'var(--color-danger)', marginTop: '-0.5rem' }}>{teachersError}</p>
              )}
            </div>
          )}

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          Already have an account? <a href="/login" style={{ color: 'var(--color-primary)' }}>Login here</a>
        </div>
      </div>
    </div>
  )
}
