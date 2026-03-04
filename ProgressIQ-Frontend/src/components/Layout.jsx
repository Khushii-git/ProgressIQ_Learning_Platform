import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import '../styles/layout.css'

export function Header({ title = 'Dashboard' }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="layout-header">
      <h2>{title}</h2>
      <div className="flex gap-md" style={{ alignItems: 'center' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="user-name">{user?.username}</div>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ children }) {
  return <aside className="sidebar">{children}</aside>
}

export function SidebarHeader() {
  return (
    <div className="sidebar-header">
      <div className="sidebar-logo">📊</div>
      <div>
        <div className="sidebar-title">ProgressIQ</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
          Smart Analytics
        </div>
      </div>
    </div>
  )
}

export function SidebarNav({ children }) {
  return <nav className="sidebar-nav">{children}</nav>
}

export function NavItem({ icon, label, onClick, active, href, ...props }) {
  const content = (
    <>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={`nav-item ${active ? 'active' : ''}`}
        {...props}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      {...props}
    >
      {content}
    </div>
  )
}

export function SidebarFooter({ children }) {
  return <div className="sidebar-footer">{children}</div>
}

export function UserProfile({ user }) {
  return (
    <div className="user-profile">
      <div className="user-avatar">{user?.username?.substring(0, 2).toUpperCase()}</div>
      <div className="user-info">
        <div className="user-name">{user?.username}</div>
        <div className="user-role">{user?.role?.toLowerCase()}</div>
      </div>
    </div>
  )
}

export function Layout({ children, sidebar }) {
  return (
    <div className="layout">
      {sidebar && <Sidebar>{sidebar}</Sidebar>}
      <div className="layout-content">{children}</div>
    </div>
  )
}
