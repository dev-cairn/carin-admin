export interface FeedbackItem {
  id: string
  email: string
  category: string
  severity: 'critical' | 'high' | 'normal' | 'low' | string
  subject: string
  message: string
  envSummary: string
  status: 'unread' | 'in_review' | 'resolved'
  submittedAt: number
  createdAt?: string
}

export type StatusFilter = 'all' | 'unread' | 'in_review' | 'resolved'
export type CategoryFilter = 'all' | 'bug' | 'feature' | 'security' | 'ui' | 'general'
export type SeverityFilter = 'all' | 'critical' | 'high' | 'normal' | 'low'

export interface ParsedEnvSummary {
  version?: string
  electron?: string
  chromium?: string
  os?: string
  arch?: string
  memory?: string
  partition?: string
  raw: string
}

export type AdminActiveTab = 'devices' | 'feedback' | 'themes' | 'notices'

export interface InstallationRecord {
  id: string
  installationId: string
  os: string
  platform: string
  arch?: string
  browserVersion: string
  firstInstalled: number
  lastSeen: number
  ipInfo?: string
}

export interface BrowserTheme {
  id: string
  name: string
  type: 'color' | 'gradient' | 'image' | 'gif'
  mediaUrl: string // base64 or URL
  backgroundColor: string
  accentColor: string
  textColor: 'light' | 'dark'
  headerOpacity: number
  updatedAt: number
  updatedBy?: string
  isPublished: boolean
}

export interface BrowserNotice {
  id: string
  noticeId: string
  title: string
  subtitle?: string
  badge?: string // e.g. 'NEW FEATURE', 'WHAT'S NEW', 'SECURITY', 'ANNOUNCEMENT'
  content: string
  featuresList: string[]
  actionUrl?: string // e.g. 'cairn://whats-new' or 'https://...'
  actionText?: string
  isActive: boolean
  publishedAt: number
  version?: string
}
