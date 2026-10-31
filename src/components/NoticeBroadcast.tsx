import React, { useState } from 'react'
import { BrowserNotice } from '../types'
import { db, doc, setDoc, deleteDoc } from '../firebase'

interface NoticeBroadcastProps {
  notices: BrowserNotice[]
  activeNotice: BrowserNotice | null
  loading: boolean
}

export const NoticeBroadcast: React.FC<NoticeBroadcastProps> = ({ notices, activeNotice, loading }) => {
  const [title, setTitle] = useState(activeNotice?.title || 'What’s New in Cairn Browser v1.2')
  const [subtitle, setSubtitle] = useState(
    activeNotice?.subtitle || 'Faster page loads, custom theme engine, and sovereign security enhancements.'
  )
  const [badge, setBadge] = useState(activeNotice?.badge || 'WHAT’S NEW')
  const [content, setContent] = useState(
    activeNotice?.content || 'Experience total privacy and lightning performance with our latest release.'
  )
  const [featuresList, setFeaturesList] = useState<string[]>(
    activeNotice?.featuresList?.length
      ? activeNotice.featuresList
      : [
          '✨ Live Theme Studio: Support for custom animated GIFs & festival banners',
          '🛡️ Sovereign Privacy Shields: Zero third-party telemetry or surveillance',
          '⚡ Instant Tab Switching: Zero lag split-screen multi-tasking',
          '🔒 On-device encrypted credential vault and 2FA protection'
        ]
  )
  const [newFeatureText, setNewFeatureText] = useState('')
  const [actionUrl, setActionUrl] = useState(activeNotice?.actionUrl || 'cairn://whats-new')
  const [actionText, setActionText] = useState(activeNotice?.actionText || 'Explore Cairn Features')
  const [noticeSlug, setNoticeSlug] = useState(activeNotice?.noticeId || `cairn-update-${new Date().toISOString().slice(0, 10)}`)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return
    setFeaturesList([...featuresList, newFeatureText.trim()])
    setNewFeatureText('')
  }

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx))
  }

  // Publish / Broadcast Notice
  const handleBroadcast = async (activate: boolean) => {
    setPublishing(true)
    setMessage(null)

    try {
      const cleanSlug = (noticeSlug || `notice-${Date.now()}`).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      const payload: BrowserNotice = {
        id: cleanSlug,
        noticeId: cleanSlug,
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        content: content.trim(),
        featuresList: featuresList.filter((f) => f.trim().length > 0),
        actionUrl: actionUrl.trim() || 'cairn://whats-new',
        actionText: actionText.trim() || 'Got It',
        isActive: activate,
        publishedAt: Date.now()
      }

      await setDoc(doc(db, 'browser_notices', cleanSlug), payload)

      // Also set doc in 'browser_notices/active_broadcast' for instant client lookup
      if (activate) {
        await setDoc(doc(db, 'browser_notices', 'active_broadcast'), payload)
      } else {
        await setDoc(doc(db, 'browser_notices', 'active_broadcast'), {
          ...payload,
          isActive: false
        })
      }

      setMessage({
        text: activate
          ? `✓ Broadcast Live: "${payload.title}" is now active! All Cairn Browsers will open this What's New tab one-time only.`
          : '✓ Notice saved and deactivated.',
        type: 'success'
      })
    } catch (err: any) {
      console.error('Broadcast error:', err)
      setMessage({ text: `Failed to broadcast notice: ${err.message}`, type: 'error' })
    } finally {
      setPublishing(false)
    }
  }

  // Delete notice
  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm(`Delete notice "${id}"?`)) return
    try {
      await deleteDoc(doc(db, 'browser_notices', id))
      if (activeNotice?.id === id) {
        await deleteDoc(doc(db, 'browser_notices', 'active_broadcast'))
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  return (
    <div className="notice-broadcast">
      <div className="notice-header">
        <div>
          <h2 className="notice-title">Browser Notice &amp; What’s New Broadcaster</h2>
          <p className="notice-desc">
            Broadcast announcement or release notices to all installed browsers. When published, each user&apos;s Cairn Browser will automatically open a &quot;What’s New&quot; tab <strong>one-time only</strong> (persisted locally like Google Chrome).
          </p>
        </div>

        <div className="notice-top-actions">
          <button
            type="button"
            className="btn-notice-draft"
            onClick={() => handleBroadcast(false)}
            disabled={publishing}
          >
            Save as Inactive
          </button>
          <button
            id="btn-broadcast-notice"
            type="button"
            className="btn-notice-publish"
            onClick={() => handleBroadcast(true)}
            disabled={publishing}
          >
            {publishing ? 'Broadcasting...' : '📢 Publish & Broadcast to All Devices'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`theme-alert is-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Grid: Editor on Left, Live "What's New" Tab Mockup on Right */}
      <div className="notice-content-grid">
        {/* Left: Broadcast Form */}
        <div className="notice-panel">
          <div className="panel-header">
            <h3>Announcement Details</h3>
            <span className="panel-tag">One-Time Tab Trigger</span>
          </div>

          <div className="customizer-form">
            <div className="form-group">
              <label>Notice Unique ID / Version Slug</label>
              <input
                id="notice-slug-input"
                type="text"
                className="studio-input"
                value={noticeSlug}
                onChange={(e) => setNoticeSlug(e.target.value)}
                placeholder="e.g. cairn-v1-2, festival-eid, notice-security"
              />
              <span className="input-hint">
                Each browser tracks this ID. When a browser sees a new ID, it opens the tab exactly once.
              </span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Badge Tag</label>
                <input
                  type="text"
                  className="studio-input"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="WHAT’S NEW, UPDATE, SECURITY"
                />
              </div>

              <div className="form-group">
                <label>Action Button Text</label>
                <input
                  type="text"
                  className="studio-input"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="e.g. Got it, Explore Features"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Headline Title</label>
              <input
                id="notice-title-input"
                type="text"
                className="studio-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. What's New in Cairn Browser"
              />
            </div>

            <div className="form-group">
              <label>Subtitle / Summary</label>
              <input
                type="text"
                className="studio-input"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Short punchy summary"
              />
            </div>

            <div className="form-group">
              <label>Overview Message</label>
              <textarea
                className="studio-textarea"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full announcement description..."
              />
            </div>

            {/* Feature Highlights List */}
            <div className="form-group">
              <label>Feature Bullet Highlights ({featuresList.length})</label>
              <div className="feature-input-row">
                <input
                  type="text"
                  className="studio-input"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="Add a new feature bullet point..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFeature()
                    }
                  }}
                />
                <button type="button" className="btn-add-feature" onClick={handleAddFeature}>
                  + Add
                </button>
              </div>

              <div className="feature-bullets-list">
                {featuresList.map((item, idx) => (
                  <div key={idx} className="feature-bullet-item">
                    <span>{item}</span>
                    <button
                      type="button"
                      className="bullet-remove-btn"
                      onClick={() => handleRemoveFeature(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Destination URL (Optional)</label>
              <input
                type="text"
                className="studio-input"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="cairn://whats-new or external website link"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Chrome-Style "What's New" Tab Mockup */}
        <div className="notice-panel">
          <div className="panel-header">
            <h3>Chrome-Style &quot;What’s New&quot; Tab Preview</h3>
            <span className="panel-tag">User View</span>
          </div>

          <div className="whats-new-mock-tab">
            <div className="mock-tab-window-chrome">
              <div className="mock-tab-window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="mock-tab-url-pill">
                <span>cairn://whats-new • One-Time Tab</span>
              </div>
            </div>

            <div className="mock-whats-new-body">
              <div className="whats-new-hero">
                <span className="hero-badge">{badge || 'WHAT’S NEW'}</span>
                <h1 className="hero-title">{title || 'Notice Title'}</h1>
                <p className="hero-sub">{subtitle}</p>
              </div>

              <div className="whats-new-card">
                <p className="card-desc">{content}</p>

                <div className="highlights-box">
                  <h4>HIGHLIGHTS IN THIS RELEASE</h4>
                  <ul>
                    {featuresList.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="card-btn-row">
                  <button type="button" className="mock-action-btn">
                    {actionText || 'Get Started'} →
                  </button>
                </div>
              </div>

              <div className="whats-new-footer-note">
                🔒 Displayed once per device installation • Never disrupts your browsing
              </div>
            </div>
          </div>

          {/* Past Broadcasts List */}
          <div className="past-notices-section">
            <h4 className="past-notices-title">Broadcasting History</h4>
            {loading ? (
              <p className="loading-sub">Loading notices...</p>
            ) : notices.length === 0 ? (
              <p className="empty-sub">No previous notices published yet.</p>
            ) : (
              <div className="notices-archive-list">
                {notices.map((n) => (
                  <div key={n.id} className="notice-archive-item">
                    <div className="archive-info">
                      <div className="archive-title-row">
                        <strong>{n.title}</strong>
                        {n.isActive && <span className="active-pill">LIVE NOW</span>}
                      </div>
                      <span className="archive-meta">
                        ID: <code>{n.noticeId}</code> • {new Date(n.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="archive-actions">
                      <button
                        type="button"
                        className="btn-delete-notice"
                        onClick={() => handleDeleteNotice(n.id)}
                        title="Delete Notice"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
