import React from 'react'
import { FeedbackItem } from '../types'

interface FeedbackCardProps {
  item: FeedbackItem
  onUpdateStatus: (id: string, newStatus: 'unread' | 'in_review' | 'resolved') => void
  onDelete: (id: string) => void
  onViewTelemetry: (item: FeedbackItem) => void
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  item,
  onUpdateStatus,
  onDelete,
  onViewTelemetry
}) => {
  const dateStr = item.submittedAt 
    ? new Date(item.submittedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Unknown date'

  const mailtoHref = `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(
    `Re: [Cairn Browser Feedback #${item.id.slice(0, 8)}] ${item.subject || 'Your Submission'}`
  )}&body=${encodeURIComponent(
    `Hi,\n\nThank you for reaching out regarding Cairn Browser.\n\nIn reference to your feedback:\n"${item.message}"\n\n`
  )}`

  return (
    <article className={`feedback-card is-${item.status}`} id={`feedback-card-${item.id}`}>
      <header className="card-header">
        <div className="card-tags">
          <span className={`status-badge ${item.status}`}>
            ● {item.status.replace('_', ' ')}
          </span>
          <span className="category-badge">
            {item.category}
          </span>
          {item.severity && item.severity !== 'normal' && (
            <span className={`severity-badge ${item.severity}`}>
              {item.severity}
            </span>
          )}
        </div>
        <time className="card-timestamp" dateTime={new Date(item.submittedAt || Date.now()).toISOString()}>
          {dateStr}
        </time>
      </header>

      {item.subject && (
        <h3 className="card-subject">{item.subject}</h3>
      )}

      <div className="card-message">
        {item.message}
      </div>

      <footer className="card-footer">
        <div className="sender-info">
          <a href={mailtoHref} className="sender-email" title="Click to compose reply in email client">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>{item.email}</span>
          </a>
          <span className="submission-id-chip" title="Unique Firestore Document ID">
            #{item.id.slice(0, 8)}
          </span>
        </div>

        <div className="card-actions">
          {item.envSummary && (
            <button
              id={`btn-telemetry-${item.id}`}
              className="btn-action"
              onClick={() => onViewTelemetry(item)}
              title="Inspect user client runtime & hardware telemetry"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Telemetry</span>
            </button>
          )}

          <a
            id={`btn-reply-${item.id}`}
            href={mailtoHref}
            className="btn-action"
            title="Open email composer to reply"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            <span>Reply</span>
          </a>

          {item.status !== 'in_review' && item.status !== 'resolved' && (
            <button
              id={`btn-status-review-${item.id}`}
              className="btn-action btn-status"
              onClick={() => onUpdateStatus(item.id, 'in_review')}
              title="Mark this feedback as in review"
            >
              <span>Mark Review</span>
            </button>
          )}

          {item.status !== 'resolved' && (
            <button
              id={`btn-status-resolved-${item.id}`}
              className="btn-action btn-status"
              style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
              onClick={() => onUpdateStatus(item.id, 'resolved')}
              title="Mark this feedback as resolved"
            >
              <span>Resolve</span>
            </button>
          )}

          {item.status === 'resolved' && (
            <button
              id={`btn-status-reopen-${item.id}`}
              className="btn-action"
              onClick={() => onUpdateStatus(item.id, 'unread')}
              title="Reopen feedback as unread"
            >
              <span>Reopen</span>
            </button>
          )}

          <button
            id={`btn-delete-${item.id}`}
            className="btn-action btn-delete"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this submission?')) {
                onDelete(item.id)
              }
            }}
            title="Permanently remove submission from Firestore"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </footer>
    </article>
  )
}
