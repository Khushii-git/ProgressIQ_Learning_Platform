import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/global.css'
import '../styles/components.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 ProgressIQ
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-2xl) var(--spacing-xl)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📊</div>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ProgressIQ
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            fontWeight: '400'
          }}>
            Where Structured Learning Meets Smart Progress Analytics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: '2rem',
            marginTop: '2rem'
          }}>
            <div className="card card-sm">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Teacher Tools</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Manage students, track progress, and create assignments effortlessly
              </p>
            </div>
            <div className="card card-sm">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Analytics</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Real-time insights into student performance and learning outcomes
              </p>
            </div>
            <div className="card card-sm">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Student Focus</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Track your learning journey with beautiful progress visualizations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-lg)', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Get Started
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/register')}>
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--bg-tertiary)'
      }}>
        <p>&copy; 2024 ProgressIQ. All rights reserved. Made with ❤️ for education.</p>
      </footer>
    </div>
  )
}
