/**
 * Cairn Sovereign Admin - Google Authenticator (TOTP) & 7-Day Session Manager
 * Implements RFC 6238 Time-based One-Time Password algorithm via native Web Crypto API.
 */

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export interface Admin2FASession {
  userEmail: string
  verifiedAt: number
  expiresAt: number
}

// Convert Base32 string to Uint8Array
export function base32ToUint8Array(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  const output: number[] = []

  for (let i = 0; i < base32.length; i++) {
    const char = base32[i].toUpperCase()
    if (char === '=' || char === ' ') continue
    const index = alphabet.indexOf(char)
    if (index === -1) continue

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

/**
 * Generates current 6-digit TOTP code for verification using HMAC-SHA1
 */
export async function generateTOTPCode(secretBase32: string, offsetSteps = 0): Promise<string> {
  const keyBytes = base32ToUint8Array(secretBase32)
  const keyBuffer = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength
  ) as ArrayBuffer
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const epoch = Math.floor(Date.now() / 1000)
  const currentStep = BigInt(Math.floor(epoch / 30) + offsetSteps)

  const timeBuffer = new ArrayBuffer(8)
  const timeView = new DataView(timeBuffer)
  timeView.setBigInt64(0, currentStep, false) // Big-endian

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, timeBuffer)
  const hash = new Uint8Array(signature)

  const offset = hash[hash.length - 1] & 0xf
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  return (binary % 1000000).toString().padStart(6, '0')
}

/**
 * Verifies a 6-digit code against the secret, allowing a ±1 step (30s) drift tolerance.
 */
export async function verifyGoogleAuthenticatorCode(token: string, secretBase32: string): Promise<boolean> {
  const cleanToken = token.trim().replace(/\s+/g, '')
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return false
  }

  // Check current window, -30s window, +30s window
  for (const offset of [0, -1, 1]) {
    try {
      const expected = await generateTOTPCode(secretBase32, offset)
      if (expected === cleanToken) {
        return true
      }
    } catch (e) {
      console.error('[TOTP] Verification error:', e)
    }
  }

  return false
}

const STORAGE_SECRET_KEY = 'cairn_admin_totp_secret'
const STORAGE_SESSION_KEY = 'cairn_admin_2fa_session'

// Deterministic default admin secret key (Strict RFC 4648 Base32 format: A-Z, 2-7 only)
export const DEFAULT_ADMIN_TOTP_SECRET = 'CAIRNBROWSERAUTH'

// Helper to check valid Base32 (no 0, 1, 8, 9 allowed in RFC 4648)
export function isValidBase32Secret(secret: string): boolean {
  if (!secret || secret.length < 16) return false
  return /^[A-Z2-7]+=*$/i.test(secret.replace(/\s+/g, ''))
}

/**
 * Retrieves the persistent admin TOTP secret from localStorage or initializes default
 */
export function getAdminTOTPSecret(): string {
  try {
    const existing = localStorage.getItem(STORAGE_SECRET_KEY)
    if (existing && isValidBase32Secret(existing)) {
      return existing.toUpperCase()
    }
    // Clean up stale or invalid secret from prior versions
    localStorage.setItem(STORAGE_SECRET_KEY, DEFAULT_ADMIN_TOTP_SECRET)
    return DEFAULT_ADMIN_TOTP_SECRET
  } catch {
    return DEFAULT_ADMIN_TOTP_SECRET
  }
}

/**
 * Allows regenerating or resetting to a fresh Base32 key if needed
 */
export function resetAdminTOTPSecret(customSecret?: string): string {
  const newSecret = customSecret && isValidBase32Secret(customSecret) ? customSecret.toUpperCase() : DEFAULT_ADMIN_TOTP_SECRET
  try {
    localStorage.setItem(STORAGE_SECRET_KEY, newSecret)
  } catch {
    // ignore
  }
  return newSecret
}

/**
 * Builds the standard otpauth:// URL for QR code generation & scanning into Google Authenticator
 */
export function getOTPAuthURL(email: string, secret: string): string {
  const cleanEmail = (email || 'admin').trim()
  const label = encodeURIComponent(`Cairn:${cleanEmail}`)
  const issuer = encodeURIComponent('CairnBrowser')
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
}

/**
 * Session verification: Checks whether the 7-day 2FA session is still valid
 */
export function is2FASessionValid(userEmail?: string | null): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY)
    if (!raw) return false

    const session: Admin2FASession = JSON.parse(raw)
    if (!session || !session.expiresAt || !session.verifiedAt) {
      return false
    }

    // Check if 7-day expiration has passed
    if (Date.now() >= session.expiresAt) {
      clear2FASession()
      return false
    }

    // Ensure session matches active Google email if provided
    if (userEmail && session.userEmail && session.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Saves a fresh 7-day session after successful Google Authenticator verification
 */
export function set2FASession(userEmail: string): Admin2FASession {
  const now = Date.now()
  const session: Admin2FASession = {
    userEmail: userEmail || 'Admin',
    verifiedAt: now,
    expiresAt: now + SEVEN_DAYS_MS
  }
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session))
  } catch (err) {
    console.warn('[TOTP] Failed to save 2FA session:', err)
  }
  return session
}

/**
 * Clears the 2FA session upon expiration or manual sign-out
 */
export function clear2FASession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY)
  } catch {
    // ignore
  }
}

/**
 * Returns remaining time for display (days and hours)
 */
export function getRemaining2FATime(): { days: number; hours: number; expired: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY)
    if (!raw) return { days: 0, hours: 0, expired: true }
    const session: Admin2FASession = JSON.parse(raw)
    const diff = session.expiresAt - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, expired: true }
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    return { days, hours, expired: false }
  } catch {
    return { days: 0, hours: 0, expired: true }
  }
}
