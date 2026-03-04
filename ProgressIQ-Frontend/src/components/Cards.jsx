import React from 'react'

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardTitle({ children }) {
  return <div className="card-title">{children}</div>
}

export function CardSubtitle({ children }) {
  return <div className="card-subtitle">{children}</div>
}

export function CardBody({ children }) {
  return <div>{children}</div>
}

export function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {title}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: `var(--color-${color})` }}>
            {value}
          </div>
        </div>
        <div
          style={{
            fontSize: '2.5rem',
            opacity: 0.3
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export function ProgressCard({ title, completed, total, percentage }) {
  return (
    <Card className="card-sm">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '500' }}>{title}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {completed}/{total}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {percentage}% Complete
        </div>
      </div>
    </Card>
  )
}

export function ContentCard({ title, description, status, onAction, actionLabel = 'View' }) {
  return (
    <Card className="card-sm">
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h4>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{description}</p>
        {status && (
          <div style={{ marginTop: '0.5rem' }}>
            <span
              className={`badge badge-${status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'info'}`}
            >
              {status}
            </span>
          </div>
        )}
      </div>
      <button className="btn btn-primary btn-sm" onClick={onAction}>
        {actionLabel}
      </button>
    </Card>
  )
}

export function ChartCard({ title, children }) {
  return (
    <Card>
      <h3 style={{ marginBottom: '1.5rem' }}>{title}</h3>
      {children}
    </Card>
  )
}
