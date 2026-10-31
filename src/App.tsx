import React, { useState, useEffect, useMemo } from 'react'
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut,
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  User 
} from './firebase'
import { 
  FeedbackItem, 
  StatusFilter, 
  CategoryFilter, 
  SeverityFilter, 
  AdminActiveTab, 
  InstallationRecord, 
  BrowserTheme, 
  BrowserNotice 
} from './types'
import { Navbar } from './components/Navbar'
import { NavigationTabs } from './components/NavigationTabs'
import { LoginModal } from './components/LoginModal'
import { DevicesDashboard } from './components/DevicesDashboard'
import { ThemeStudio } from './components/ThemeStudio'
import { NoticeBroadcast } from './components/NoticeBroadcast'
import { MetricsOverview } from './components/MetricsOverview'
import { FilterBar } from './components/FilterBar'
import { FeedbackCard } from './components/FeedbackCard'
import { TelemetryModal } from './components/TelemetryModal'
import { is2FASessionValid, clear2FASession } from './utils/totp'

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [is2FAVerified, setIs2FAVerified] = useState<boolean>(() => is2FASessionValid())
  const [authChecking, setAuthChecking] = useState(true)
  const [kickoutError, setKickoutError] = useState<string | null>(null)

  // Section Navigation
  const [activeTab, setActiveTab] = useState<AdminActiveTab>('devices')

  // Feedback State
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [firestoreError, setFirestoreError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [telemetryItem, setTelemetryItem] = useState<FeedbackItem | null>(null)

  // Devices State (Koyta device e browser installed)
  const [devices, setDevices] = useState<InstallationRecord[]>([])
  const [loadingDevices, setLoadingDevices] = useState(true)

  // Theme Studio State (GIF & Color theme upload & publish)
  const [currentTheme, setCurrentTheme] = useState<BrowserTheme | null>(null)

  // Notices & What's New State (One-time popup tab in browser)
  const [notices, setNotices] = useState<BrowserNotice[]>([])
  const [activeNotice, setActiveNotice] = useState<BrowserNotice | null>(null)
  const [loadingNotices, setLoadingNotices] = useState(true)

  // 1. Auth state subscription with 7-Day 2FA validity check & strict email restriction
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const email = (currentUser.email || '').trim().toLowerCase()
        if (email !== 'lifet4542@gmail.com') {
          console.warn('[Cairn Admin] Unauthorized email attempt rejected:', email)
          await signOut(auth)
          setUser(null)
          setIs2FAVerified(false)
          clear2FASession()
          setKickoutError(`Access Denied: (${currentUser.email || 'Unknown'}) is unauthorized. Only lifet4542@gmail.com can access Cairn Admin.`)
          setAuthChecking(false)
          return
        }
        setUser(currentUser)
        setKickoutError(null)
        const valid = is2FASessionValid(currentUser.email)
        setIs2FAVerified(valid)
      } else {
        setUser(null)
        setIs2FAVerified(false)
        clear2FASession()
      }
      setAuthChecking(false)
    })
    return () => unsubscribe()
  }, [])

  // 2. Real-time Firestore feedback synchronization
  useEffect(() => {
    if (!user || !is2FAVerified) {
      setItems([])
      setLoadingItems(false)
      return
    }

    setLoadingItems(true)
    const colRef = collection(db, 'feedback_submissions')
    const q = query(colRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: FeedbackItem[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          fetched.push({
            id: docSnap.id,
            email: data.email || 'Anonymous',
            category: data.category || 'general',
            severity: data.severity || 'normal',
            subject: data.subject || '',
            message: data.message || '',
            envSummary: data.envSummary || '',
            status: data.status || 'unread',
            submittedAt: data.submittedAt ? Number(data.submittedAt) : Date.now(),
            createdAt: data.createdAt
          })
        })

        fetched.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
        setItems(fetched)
        setLoadingItems(false)
      },
      (err) => {
        console.error('Feedback subscription error:', err)
        setFirestoreError(err.message)
        setLoadingItems(false)
      }
    )

    return () => unsubscribe()
  }, [user, is2FAVerified])

  // 3. Real-time Devices synchronization (browser_installations)
  useEffect(() => {
    if (!user || !is2FAVerified) {
      setDevices([])
      setLoadingDevices(false)
      return
    }

    setLoadingDevices(true)
    const colRef = collection(db, 'browser_installations')
    const q = query(colRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: InstallationRecord[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          fetched.push({
            id: docSnap.id,
            installationId: data.installationId || docSnap.id,
            os: data.os || 'Unknown OS',
            platform: data.platform || 'Unknown',
            arch: data.arch,
            browserVersion: data.browserVersion || 'v1.0.0',
            firstInstalled: Number(data.firstInstalled) || Date.now(),
            lastSeen: Number(data.lastSeen) || Date.now(),
            ipInfo: data.ipInfo
          })
        })

        // Sort by lastSeen descending
        fetched.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
        setDevices(fetched)
        setLoadingDevices(false)
      },
      (err) => {
        console.error('Devices subscription error:', err)
        setLoadingDevices(false)
      }
    )

    return () => unsubscribe()
  }, [user, is2FAVerified])

  // 4. Real-time Theme synchronization (browser_theme/active_theme)
  useEffect(() => {
    if (!user || !is2FAVerified) return

    const docRef = doc(db, 'browser_theme', 'active_theme')
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as BrowserTheme
          setCurrentTheme(data)
        } else {
          setCurrentTheme(null)
        }
      },
      (err) => {
        console.error('Theme subscription error:', err)
      }
    )

    return () => unsubscribe()
  }, [user, is2FAVerified])

  // 5. Real-time Notices synchronization (browser_notices)
  useEffect(() => {
    if (!user || !is2FAVerified) {
      setNotices([])
      setActiveNotice(null)
      setLoadingNotices(false)
      return
    }

    setLoadingNotices(true)
    const colRef = collection(db, 'browser_notices')
    const q = query(colRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: BrowserNotice[] = []
        let liveNotice: BrowserNotice | null = null

        snapshot.forEach((docSnap) => {
          if (docSnap.id === 'active_broadcast') return // Internal lookup alias
          const data = docSnap.data() as BrowserNotice
          const noticeItem: BrowserNotice = {
            id: docSnap.id,
            noticeId: data.noticeId || docSnap.id,
            title: data.title || 'Announcement',
            subtitle: data.subtitle,
            badge: data.badge,
            content: data.content || '',
            featuresList: data.featuresList || [],
            actionUrl: data.actionUrl,
            actionText: data.actionText,
            isActive: Boolean(data.isActive),
            publishedAt: Number(data.publishedAt) || Date.now()
          }
          fetched.push(noticeItem)
          if (noticeItem.isActive && !liveNotice) {
            liveNotice = noticeItem
          }
        })

        fetched.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
        setNotices(fetched)
        setActiveNotice(liveNotice)
        setLoadingNotices(false)
      },
      (err) => {
        console.error('Notices subscription error:', err)
        setLoadingNotices(false)
      }
    )

    return () => unsubscribe()
  }, [user, is2FAVerified])

  // Update status handler for feedback
  const handleUpdateStatus = async (id: string, newStatus: 'unread' | 'in_review' | 'resolved') => {
    try {
      const docRef = doc(db, 'feedback_submissions', id)
      await updateDoc(docRef, { status: newStatus })
    } catch (err: any) {
      console.error('Failed to update status:', err)
      alert(`Could not update status: ${err.message}`)
    }
  }

  // Delete feedback submission
  const handleDeleteFeedback = async (id: string) => {
    try {
      const docRef = doc(db, 'feedback_submissions', id)
      await deleteDoc(docRef)
    } catch (err: any) {
      console.error('Failed to delete submission:', err)
      alert(`Could not delete submission: ${err.message}`)
    }
  }

  // Filtered feedback items
  const filteredFeedback = useMemo(() => {
    return items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false
      if (category !== 'all' && item.category.toLowerCase() !== category.toLowerCase()) return false
      if (severity !== 'all' && item.severity.toLowerCase() !== severity.toLowerCase()) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchEmail = item.email.toLowerCase().includes(q)
        const matchSubject = item.subject.toLowerCase().includes(q)
        const matchMessage = item.message.toLowerCase().includes(q)
        const matchId = item.id.toLowerCase().includes(q)
        if (!matchEmail && !matchSubject && !matchMessage && !matchId) return false
      }
      return true
    })
  }, [items, status, category, severity, search])

  const unreadFeedbackCount = useMemo(() => {
    return items.filter((it) => it.status === 'unread').length
  }, [items])

  if (authChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#090a0d', color: '#10b981', fontFamily: 'monospace' }}>
        <p>✦ Initializing Cairn Sovereign Admin Portal...</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        totalCount={items.length} 
        is2FAVerified={is2FAVerified} 
        onSignOut={() => setIs2FAVerified(false)} 
      />

      {!user || !is2FAVerified ? (
        <LoginModal 
          user={user} 
          kickoutError={kickoutError}
          on2FAVerified={() => {
            setKickoutError(null)
            setIs2FAVerified(true)
          }} 
        />
      ) : (
        <main className="main-content">
          {/* Top 4 Primary Navigation Tabs */}
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            deviceCount={devices.length}
            feedbackCount={items.length}
            unreadFeedbackCount={unreadFeedbackCount}
            activeThemeName={currentTheme?.isPublished ? currentTheme.name : undefined}
            activeNoticeTitle={activeNotice?.title}
          />

          {firestoreError && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.12)', 
                border: '1px solid rgba(239, 68, 68, 0.35)', 
                color: '#fca5a5', 
                padding: '16px 20px', 
                borderRadius: '12px',
                marginBottom: '20px'
              }}
            >
              <strong>Firestore Notice:</strong> {firestoreError}
              <div style={{ fontSize: '0.84rem', marginTop: '6px', color: '#fecaca' }}>
                Please ensure Firestore Security Rules in <code>admin/firestore.rules</code> are deployed to project <code>cairn-browser-db</code>.
              </div>
            </div>
          )}

          {/* TAB 1: DEVICES & INSTALLATION METRICS */}
          {activeTab === 'devices' && (
            <DevicesDashboard 
              devices={devices} 
              loading={loadingDevices} 
            />
          )}

          {/* TAB 2: FEEDBACK MESSAGES & TRIAGE */}
          {activeTab === 'feedback' && (
            <section className="feedback-section">
              <MetricsOverview items={items} />

              <FilterBar
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                category={category}
                onCategoryChange={setCategory}
                severity={severity}
                onSeverityChange={setSeverity}
              />

              {loadingItems ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <p>✦ Syncing real-time feedback submissions from Cloud Firestore...</p>
                </div>
              ) : filteredFeedback.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                  </svg>
                  <h3 className="empty-title">No Feedback Submissions Found</h3>
                  <p className="empty-desc">
                    {items.length === 0 
                      ? 'No feedback has been submitted to Firestore yet. When users submit feedback through Cairn Center in the browser, it will appear here instantly.'
                      : 'No submissions match your active filter criteria. Try clearing or relaxing the search filters.'}
                  </p>
                </div>
              ) : (
                <section className="feedback-list" aria-label="Feedback Submissions List">
                  {filteredFeedback.map((item) => (
                    <FeedbackCard
                      key={item.id}
                      item={item}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDeleteFeedback}
                      onViewTelemetry={(it) => setTelemetryItem(it)}
                    />
                  ))}
                </section>
              )}
            </section>
          )}

          {/* TAB 3: THEME STUDIO (GIF & COLOR & FESTIVAL/FLAG THEMES) */}
          {activeTab === 'themes' && (
            <ThemeStudio 
              currentTheme={currentTheme}
              onPublishSuccess={(theme) => setCurrentTheme(theme)}
            />
          )}

          {/* TAB 4: NOTICES & ONE-TIME WHAT'S NEW TAB BROADCAST */}
          {activeTab === 'notices' && (
            <NoticeBroadcast
              notices={notices}
              activeNotice={activeNotice}
              loading={loadingNotices}
            />
          )}

          {/* Telemetry Modal for Feedback inspection */}
          {telemetryItem && (
            <TelemetryModal
              item={telemetryItem}
              onClose={() => setTelemetryItem(null)}
            />
          )}
        </main>
      )}
    </div>
  )
}
