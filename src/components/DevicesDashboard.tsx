import React, { useState, useMemo } from 'react'
import { InstallationRecord } from '../types'
import { db, doc, deleteDoc } from '../firebase'

interface DevicesDashboardProps {
  devices: InstallationRecord[]
  loading: boolean
}

export const DevicesDashboard: React.FC<DevicesDashboardProps> = ({ devices, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [osFilter, setOsFilter] = useState<string>('all')

  // Calculate OS breakdown
  const stats = useMemo(() => {
    const total = devices.length
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const oneHourAgo = now - 60 * 60 * 1000

    let activeToday = 0
    let onlineNow = 0
    let windowsCount = 0
    let macCount = 0
    let linuxCount = 0
    let otherCount = 0

    devices.forEach((d) => {
      const lastSeenTime = Number(d.lastSeen) || 0
      if (lastSeenTime >= oneHourAgo) onlineNow++
      if (lastSeenTime >= oneDayAgo) activeToday++

      const osLower = (d.os || d.platform || '').toLowerCase()
      if (osLower.includes('win')) windowsCount++
      else if (osLower.includes('mac') || osLower.includes('darwin')) macCount++
      else if (osLower.includes('linux')) linuxCount++
      else otherCount++
    })

    return {
      total,
      activeToday,
      onlineNow,
      windowsCount,
      macCount,
      linuxCount,
      otherCount,
      windowsPct: total ? Math.round((windowsCount / total) * 100) : 0,
      macPct: total ? Math.round((macCount / total) * 100) : 0,
      linuxPct: total ? Math.round((linuxCount / total) * 100) : 0,
      otherPct: total ? Math.round((otherCount / total) * 100) : 0
    }
  }, [devices])

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (osFilter !== 'all') {
        const osLower = (d.os || '').toLowerCase()
        if (osFilter === 'windows' && !osLower.includes('win')) return false
        if (osFilter === 'mac' && !osLower.includes('mac') && !osLower.includes('darwin')) return false
        if (osFilter === 'linux' && !osLower.includes('linux')) return false
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchId = (d.installationId || d.id || '').toLowerCase().includes(q)
        const matchOs = (d.os || '').toLowerCase().includes(q)
        const matchVer = (d.browserVersion || '').toLowerCase().includes(q)
        if (!matchId && !matchOs && !matchVer) return false
      }

      return true
    })
  }, [devices, searchTerm, osFilter])

  const handleDeleteDevice = async (id: string) => {
    if (!window.confirm(`Remove device installation record "${id}" from telemetry?`)) return
    try {
      await deleteDoc(doc(db, 'browser_installations', id))
    } catch (err: any) {
      alert(`Failed to delete device record: ${err.message}`)
    }
  }

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Never'
    const diffMs = Date.now() - timestamp
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="devices-dashboard">
      {/* Metrics Row */}
      <div className="devices-metrics-grid">
        <div className="metric-box is-total">
          <div className="metric-header">
            <span className="metric-title">TOTAL INSTALLED DEVICES</span>
            <div className="metric-icon-wrap" style={{ color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{stats.total}</span>
            <span className="metric-badge">All Platforms</span>
          </div>
          <div className="metric-footer">Unique installed instances globally</div>
        </div>

        <div className="metric-box is-active">
          <div className="metric-header">
            <span className="metric-title">ACTIVE TODAY (24H)</span>
            <div className="metric-icon-wrap" style={{ color: '#06b6d4' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{stats.activeToday}</span>
            <span className="metric-sub">{stats.onlineNow} Online Now</span>
          </div>
          <div className="metric-footer">Received heartbeat within 24 hours</div>
        </div>

        <div className="metric-box is-windows">
          <div className="metric-header">
            <span className="metric-title">WINDOWS DEVICES</span>
            <div className="metric-icon-wrap" style={{ color: '#38bdf8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{stats.windowsCount}</span>
            <span className="metric-pct">{stats.windowsPct}%</span>
          </div>
          <div className="metric-bar-track">
            <div className="metric-bar-fill" style={{ width: `${stats.windowsPct}%`, background: '#38bdf8' }} />
          </div>
        </div>

        <div className="metric-box is-mac">
          <div className="metric-header">
            <span className="metric-title">MACOS &amp; LINUX</span>
            <div className="metric-icon-wrap" style={{ color: '#a855f7' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{stats.macCount + stats.linuxCount}</span>
            <span className="metric-pct">{stats.macPct + stats.linuxPct}%</span>
          </div>
          <div className="metric-bar-track">
            <div className="metric-bar-fill" style={{ width: `${stats.macPct + stats.linuxPct}%`, background: '#a855f7' }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="devices-filter-bar">
        <div className="filter-search-box">
          <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="devices-search-input"
            type="text"
            placeholder="Search by Device ID, OS name, version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        <div className="filter-select-group">
          <select 
            id="devices-os-filter"
            value={osFilter} 
            onChange={(e) => setOsFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Operating Systems</option>
            <option value="windows">Windows ({stats.windowsCount})</option>
            <option value="mac">macOS ({stats.macCount})</option>
            <option value="linux">Linux ({stats.linuxCount})</option>
          </select>
        </div>
      </div>

      {/* Devices List Table */}
      {loading ? (
        <div className="devices-loading-state">
          <div className="cyber-spinner" />
          <p>Syncing installed device telemetry from Cloud Firestore...</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <h3 className="empty-title">No Installed Devices Recorded</h3>
          <p className="empty-desc">
            {devices.length === 0 
              ? 'When Cairn Browser is installed or launched on client computers, each device registers its anonymous installation heartbeat here automatically.'
              : 'No devices matched your search query. Try clearing the filter.'}
          </p>
        </div>
      ) : (
        <div className="devices-table-wrapper">
          <table className="devices-table">
            <thead>
              <tr>
                <th>STATUS</th>
                <th>DEVICE INSTALLATION ID</th>
                <th>OPERATING SYSTEM</th>
                <th>BROWSER VERSION</th>
                <th>FIRST INSTALLED</th>
                <th>LAST HEARTBEAT</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((dev) => {
                const lastSeenTime = Number(dev.lastSeen) || 0
                const isOnline = Date.now() - lastSeenTime < 60 * 60 * 1000 // < 1 hour
                const isRecent = Date.now() - lastSeenTime < 24 * 60 * 60 * 1000 // < 24h

                return (
                  <tr key={dev.id}>
                    <td>
                      <div className="status-cell">
                        <span className={`status-pulse ${isOnline ? 'is-online' : isRecent ? 'is-recent' : 'is-offline'}`} />
                        <span className="status-text">{isOnline ? 'Active' : isRecent ? 'Idle' : 'Offline'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="device-id-cell">
                        <code className="device-id-code">
                          {dev.installationId ? dev.installationId.slice(0, 18) + '...' : dev.id.slice(0, 18) + '...'}
                        </code>
                        <button
                          type="button"
                          className="copy-btn"
                          title="Copy Full ID"
                          onClick={() => {
                            navigator.clipboard.writeText(dev.installationId || dev.id)
                            alert('Copied Device ID to clipboard!')
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="os-badge-cell">
                        <span className="os-icon">
                          {dev.os?.toLowerCase().includes('win') ? '🪟' : dev.os?.toLowerCase().includes('mac') ? '🍎' : '🐧'}
                        </span>
                        <span className="os-name">{dev.os || dev.platform || 'Unknown OS'}</span>
                        {dev.arch && <span className="arch-tag">{dev.arch}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="version-pill">{dev.browserVersion || 'v1.0.0'}</span>
                    </td>
                    <td>
                      <span className="time-cell">
                        {dev.firstInstalled ? new Date(Number(dev.firstInstalled)).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="relative-time-cell" title={new Date(lastSeenTime).toLocaleString()}>
                        {formatRelativeTime(lastSeenTime)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-delete-device"
                        title="Delete device record"
                        onClick={() => handleDeleteDevice(dev.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
