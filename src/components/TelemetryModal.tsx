import React, { useState } from 'react'
import { FeedbackItem } from '../types'

interface TelemetryModalProps {
  item: FeedbackItem | null
  onClose: () => void
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false)
  if (!item) return null

  let parsed: any = null
  try {
    parsed = JSON.parse(item.envSummary)
  } catch {
    // If not JSON, treat as text
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(item.envSummary || '{}')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose} id="telemetry-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Client Telemetry &amp; Environment</span>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="modal-body">
          {parsed && typeof parsed === 'object' ? (
            <div className="telemetry-grid">
              <div className="telemetry-item">
                <div className="telemetry-label">Cairn Version</div>
                <div className="telemetry-value">{parsed.version || parsed.appVersion || '1.0.0'}</div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Operating System</div>
                <div className="telemetry-value">{parsed.os || parsed.platform || 'Windows'}</div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Architecture</div>
                <div className="telemetry-value">{parsed.arch || 'x64'}</div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Electron Core</div>
                <div className="telemetry-value">{parsed.electron || '31.0.2'}</div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Chromium Runtime</div>
                <div className="telemetry-value">{parsed.chromium || '126.0'}</div>
              </div>
              <div className="telemetry-item">
                <div className="telemetry-label">Memory Footprint</div>
                <div className="telemetry-value">{parsed.memory || 'Healthy'}</div>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Raw Diagnostics String
            </span>
            <button 
              id="btn-copy-raw-telemetry"
              className="btn-action" 
              onClick={handleCopy}
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
            >
              {copied ? '✓ Copied' : 'Copy Raw Data'}
            </button>
          </div>

          <pre className="raw-telemetry-box">
            {item.envSummary || 'No environment telemetry provided.'}
          </pre>
        </div>
      </div>
    </div>
  )
}
