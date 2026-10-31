import React, { useState, useEffect } from 'react'
import { User, signOut, auth } from '../firebase'
import { clear2FASession, getRemaining2FATime } from '../utils/totp'

interface NavbarProps {
  user: User | null
  totalCount: number
  is2FAVerified?: boolean
  onSignOut?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ user, totalCount, is2FAVerified, onSignOut }) => {
  const [sessionTime, setSessionTime] = useState(() => getRemaining2FATime())

  useEffect(() => {
    if (!is2FAVerified) return
    const interval = setInterval(() => {
      setSessionTime(getRemaining2FATime())
    }, 60000) // check every minute
    return () => clearInterval(interval)
  }, [is2FAVerified])

  const handleSignOut = async () => {
    try {
      clear2FASession()
      if (onSignOut) onSignOut()
      await signOut(auth)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="brand-info">
          <h1>
            Cairn Sovereign Admin
            <span className="brand-badge">PROD</span>
          </h1>
          <p className="brand-sub">Feedback Triage &amp; Telemetry Hub • {totalCount} Recorded</p>
        </div>
      </div>

      <div className="nav-actions">
        {/* Live Website Link */}
        <a
          href="https://dev-cairn.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: '20px',
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
          title="Open Cairn Browser Official Website (https://dev-cairn.github.io/)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Live Website ↗</span>
        </a>

        {user && is2FAVerified && (
          <>
            {/* 7-Day 2FA Status Pill */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                fontSize: '0.8rem',
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: '20px'
              }}
              title="Google Authenticator 2FA Active - Auto-expires after 7 days"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>2FA Active • {sessionTime.days}d {sessionTime.hours}h left</span>
            </div>

            <div className="user-badge" id="admin-user-badge">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Admin" className="user-avatar" />
              ) : (
                <div className="user-avatar" style={{ background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                  {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <span className="user-email">{user.email || 'Admin'}</span>
            </div>

            <button 
              id="admin-btn-signout"
              className="btn-signout" 
              onClick={handleSignOut}
              title="Sign Out of Admin Portal"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}

