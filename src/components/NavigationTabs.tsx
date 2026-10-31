import React from 'react'
import { AdminActiveTab } from '../types'

interface NavigationTabsProps {
  activeTab: AdminActiveTab
  onTabChange: (tab: AdminActiveTab) => void
  deviceCount: number
  feedbackCount: number
  unreadFeedbackCount: number
  activeThemeName?: string
  activeNoticeTitle?: string
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  deviceCount,
  feedbackCount,
  unreadFeedbackCount,
  activeThemeName,
  activeNoticeTitle
}) => {
  return (
    <nav className="admin-nav-tabs" aria-label="Admin Sections">
      <button
        id="tab-btn-devices"
        type="button"
        className={`nav-tab-item ${activeTab === 'devices' ? 'is-active' : ''}`}
        onClick={() => onTabChange('devices')}
      >
        <span className="tab-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </span>
        <span className="tab-label">Devices &amp; Installs</span>
        <span className="tab-counter-badge" title="Total Installed Instances">
          {deviceCount}
        </span>
      </button>

      <button
        id="tab-btn-feedback"
        type="button"
        className={`nav-tab-item ${activeTab === 'feedback' ? 'is-active' : ''}`}
        onClick={() => onTabChange('feedback')}
      >
        <span className="tab-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span className="tab-label">Feedback Messages</span>
        <span className="tab-counter-badge" title="Total Feedback Items">
          {feedbackCount}
        </span>
        {unreadFeedbackCount > 0 && (
          <span className="tab-unread-dot" title={`${unreadFeedbackCount} unread`} />
        )}
      </button>

      <button
        id="tab-btn-themes"
        type="button"
        className={`nav-tab-item ${activeTab === 'themes' ? 'is-active' : ''}`}
        onClick={() => onTabChange('themes')}
      >
        <span className="tab-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
          </svg>
        </span>
        <span className="tab-label">Theme Studio</span>
        {activeThemeName ? (
          <span className="tab-status-pill is-published" title={`Active: ${activeThemeName}`}>
            Live: {activeThemeName.slice(0, 12)}
          </span>
        ) : (
          <span className="tab-status-pill is-default">Default</span>
        )}
      </button>

      <button
        id="tab-btn-notices"
        type="button"
        className={`nav-tab-item ${activeTab === 'notices' ? 'is-active' : ''}`}
        onClick={() => onTabChange('notices')}
      >
        <span className="tab-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </span>
        <span className="tab-label">Notices &amp; What&apos;s New</span>
        {activeNoticeTitle ? (
          <span className="tab-status-pill is-broadcast" title={`Active Notice: ${activeNoticeTitle}`}>
            Broadcasting
          </span>
        ) : (
          <span className="tab-status-pill">Idle</span>
        )}
      </button>
    </nav>
  )
}
