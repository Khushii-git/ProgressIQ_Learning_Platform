import React, { useState } from 'react'
import '../styles/global.css'
import '../styles/components.css'

export function Button({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  block = false,
  ...props
}) {
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : ''
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const blockClass = block ? 'btn-block' : ''

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${blockClass}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'
  const inputType = isPasswordField && showPassword ? 'text' : type

  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={isPasswordField ? { paddingRight: '40px' } : {}}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</span>}
    </div>
  )
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) {
  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</span>}
    </div>
  )
}

export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  required = false,
  ...props
}) {
  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <select value={value} onChange={onChange} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</span>}
    </div>
  )
}

export function Alert({ type = 'info', message, onClose }) {
  return (
    <div className={`alert alert-${type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
          ×
        </button>
      )}
    </div>
  )
}

export function Badge({ children, variant = 'primary' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function Spinner() {
  return <div className="spinner" />
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const width = size === 'sm' ? '400px' : size === 'lg' ? '800px' : '600px'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        className="card"
        style={{
          width,
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export function Table({ headers, rows, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--bg-tertiary)' }}>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  padding: 'var(--spacing-lg)',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid var(--bg-tertiary)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'all var(--transition-fast)',
                backgroundColor: onRowClick ? 'var(--bg-secondary)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (onRowClick) e.target.parentElement.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                if (onRowClick) e.target.parentElement.style.backgroundColor = 'var(--bg-secondary)'
              }}
            >
              {row.map((cell, idx) => (
                <td
                  key={idx}
                  style={{
                    padding: 'var(--spacing-lg)',
                    fontSize: '0.95rem'
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
