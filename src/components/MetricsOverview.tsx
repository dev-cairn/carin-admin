import React from 'react'
import { FeedbackItem } from '../types'

interface MetricsOverviewProps {
  items: FeedbackItem[]
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ items }) => {
  const total = items.length
  const unread = items.filter((i) => i.status === 'unread').length
  const inReview = items.filter((i) => i.status === 'in_review').length
  const resolved = items.filter((i) => i.status === 'resolved').length
  const critical = items.filter((i) => i.severity === 'critical' || i.category === 'security').length

  return (
    <section className="metrics-grid" aria-label="Triage Overview Statistics">
      <div className="metric-card" style={{ '--accent-color': '#10b981', '--icon-bg': 'rgba(16, 185, 129, 0.12)' } as React.CSSProperties}>
        <div className="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="metric-data">
          <span className="metric-title">Total Submissions</span>
          <span className="metric-number">{total}</span>
        </div>
      </div>

      <div className="metric-card" style={{ '--accent-color': '#f59e0b', '--icon-bg': 'rgba(245, 158, 11, 0.12)' } as React.CSSProperties}>
        <div className="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="metric-data">
          <span className="metric-title">Unread / Pending</span>
          <span className="metric-number" style={{ color: '#f59e0b' }}>{unread}</span>
        </div>
      </div>

      <div className="metric-card" style={{ '--accent-color': '#06b6d4', '--icon-bg': 'rgba(6, 182, 212, 0.12)' } as React.CSSProperties}>
        <div className="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="metric-data">
          <span className="metric-title">In Review</span>
          <span className="metric-number" style={{ color: '#06b6d4' }}>{inReview}</span>
        </div>
      </div>

      <div className="metric-card" style={{ '--accent-color': '#a855f7', '--icon-bg': 'rgba(168, 85, 247, 0.12)' } as React.CSSProperties}>
        <div className="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="metric-data">
          <span className="metric-title">Resolved</span>
          <span className="metric-number" style={{ color: '#a855f7' }}>{resolved}</span>
        </div>
      </div>

      {critical > 0 && (
        <div className="metric-card" style={{ '--accent-color': '#ef4444', '--icon-bg': 'rgba(239, 68, 68, 0.15)' } as React.CSSProperties}>
          <div className="metric-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="metric-data">
            <span className="metric-title">Critical / Security</span>
            <span className="metric-number" style={{ color: '#ef4444' }}>{critical}</span>
          </div>
        </div>
      )}
    </section>
  )
}
