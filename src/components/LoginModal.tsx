import React, { useState, useEffect } from 'react'
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  User 
} from '../firebase'
import { 
  getAdminTOTPSecret, 
  getOTPAuthURL, 
  verifyGoogleAuthenticatorCode, 
  set2FASession 
} from '../utils/totp'

export const AUTHORIZED_ADMIN_EMAIL = 'lifet4542@gmail.com'

interface LoginModalProps {
  user: User | null
  on2FAVerified: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ user, on2FAVerified }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2FA TOTP State
  const [totpCode, setTotpCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const [secret] = useState(() => getAdminTOTPSecret())
  const otpUrl = user ? getOTPAuthURL(user.email || 'Admin', secret) : ''
  // Use high-contrast black on white for instant phone camera scanning
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpUrl)}&margin=8`

  // Format secret with spaces for easy reading (e.g., CAIR NBR OWS EAU TH)
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret

  // Clear inputs when user state changes
  useEffect(() => {
    setTotpCode('')
    setError(null)
  }, [user])

  // Step 1: Direct Google Login
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await signInWithPopup(auth, googleProvider)
      const email = (res.user.email || '').trim().toLowerCase()
      if (email !== AUTHORIZED_ADMIN_EMAIL) {
        await signOut(auth)
        setError(`Access Denied: (${res.user.email || 'Unknown'}) is not authorized. Only ${AUTHORIZED_ADMIN_EMAIL} can access Cairn Admin.`)
        return
      }
    } catch (err: any) {
      console.error('Google sign-in failure:', err)
      setError(err?.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify TOTP Code
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = (user?.email || '').trim().toLowerCase()
    if (!user || email !== AUTHORIZED_ADMIN_EMAIL) {
      setError(`Access Denied: Account not authorized. Only ${AUTHORIZED_ADMIN_EMAIL} is permitted.`)
      await signOut(auth)
      return
    }

    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code from Google Authenticator.')
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const isValid = await verifyGoogleAuthenticatorCode(totpCode, secret)
      if (isValid) {
        // Save 7-day active session
        set2FASession(user?.email || 'Admin')
        on2FAVerified()
      } else {
        setError('Invalid 6-digit code. Please verify the code in Google Authenticator and try again.')
      }
    } catch (err: any) {
      console.error('2FA verification failed:', err)
      setError('Verification error. Please retry.')
    } finally {
      setVerifying(false)
    }
  }

  // Copy secret key helper
  const handleCopyKey = () => {
    navigator.clipboard.writeText(secret)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  // Switch / Sign out of current Google Account
  const handleCancelGoogle = async () => {
    try {
      await signOut(auth)
      setTotpCode('')
      setError(null)
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }

  return (
    <div className="modal-overlay" style={{ background: '#090a0d' }}>
      <div className="login-card" id="admin-login-card" style={{ maxWidth: user ? '460px' : '420px' }}>
        
        {/* Top Sovereign Badge */}
        <div className="login-icon-box" style={{ background: user ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}>
          {user ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>

        <h2 className="login-title">
          {user ? 'Google Authenticator 2FA' : 'Cairn Sovereign Portal'}
        </h2>
        
        <p className="login-desc">
          {user 
            ? 'Enter your 6-digit security code. Session valid for 7 days.'
            : 'Authorized Admin Access • Single Sign-On'}
        </p>

        {error && (
          <div className="login-error" id="admin-login-error">
            {error}
          </div>
        )}

        {/* STEP 1: Direct Continue with Google */}
        {!user ? (
          <div className="login-actions" style={{ marginTop: '24px' }}>
            <button 
              id="admin-btn-google-login"
              type="button" 
              className="btn-google" 
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                borderRadius: '12px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
              🔒 Protected by Sovereign 2FA • Session auto-expires in 7 days
            </div>
          </div>
        ) : (
          /* STEP 2: Google Authenticator (TOTP) */
          <div className="totp-container" style={{ marginTop: '16px' }}>
            
            {/* Active Account Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 500 }}>{user.email}</span>
              </div>
              <button 
                type="button" 
                onClick={handleCancelGoogle}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Switch
              </button>
            </div>

            {/* QR Code & Setup Toggle */}
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowSetup(!showSetup)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>{showSetup ? 'Hide QR Code & Setup Key' : 'Need to Scan QR Code or Add to App?'}</span>
              </button>

              {showSetup && (
                <div style={{
                  marginTop: '14px',
                  background: '#0d1117',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '12px' }}>
                    Open <strong>Google Authenticator</strong> on your phone and scan:
                  </p>
                  
                  <div style={{ display: 'inline-block', padding: '12px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    <img 
                      src={qrUrl} 
                      alt="Google Authenticator QR Code" 
                      style={{ width: '160px', height: '160px', display: 'block', borderRadius: '4px' }} 
                    />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>Or enter setup key manually:</div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.92rem',
                      letterSpacing: '1px',
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      userSelect: 'all',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontWeight: 600 }}>{formattedSecret}</span>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {copiedKey ? '✓ Copied' : 'Copy Key'}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.74rem', color: '#64748b' }}>
                    💡 Tip: If you have an old entry showing <code>--- ---</code>, please delete it and scan this new QR code.
                  </div>
                </div>
              )}
            </div>

            {/* 6-Digit PIN Form */}
            <form onSubmit={handleVerify2FA}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label htmlFor="admin-totp-input" style={{ textAlign: 'center', display: 'block', fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '8px' }}>
                  6-Digit Authenticator Code
                </label>
                <input
                  id="admin-totp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.8rem',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    padding: '14px',
                    background: '#0d1117',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    borderRadius: '12px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <button
                id="admin-btn-verify-2fa"
                type="submit"
                className="btn-primary"
                disabled={verifying || totpCode.length !== 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '12px'
                }}
              >
                {verifying ? 'Verifying Code...' : 'Verify & Unlock (7-Day Pass) →'}
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  🕒 Authenticator session remains active for 7 days
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
