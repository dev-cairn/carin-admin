import React, { useState, useEffect, useRef } from 'react'
import { BrowserTheme } from '../types'
import { db, doc, setDoc } from '../firebase'

interface ThemeStudioProps {
  currentTheme: BrowserTheme | null
  onPublishSuccess?: (theme: BrowserTheme) => void
}

interface PresetThemeOption {
  name: string
  category: 'festival' | 'flag' | 'style'
  icon: string
  type: 'color' | 'gradient' | 'image' | 'gif'
  mediaUrl: string
  backgroundColor: string
  accentColor: string
  textColor: 'light' | 'dark'
  headerOpacity: number
  description: string
}

const PRESET_THEMES: PresetThemeOption[] = [
  {
    name: 'Festive Eid Mubarak',
    category: 'festival',
    icon: '🌙',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #110e38 0%, #2b1754 50%, #4a1e80 100%)',
    accentColor: '#fbbf24',
    textColor: 'light',
    headerOpacity: 0.92,
    description: 'Starry midnight purple with illuminated golden crescent and lantern glow'
  },
  {
    name: 'Bangladesh Flag Pride',
    category: 'flag',
    icon: '🇧🇩',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #004d38 0%, #006a4e 60%, #c8102e 100%)',
    accentColor: '#10b981',
    textColor: 'light',
    headerOpacity: 0.94,
    description: 'National emerald green with crimson solar horizon'
  },
  {
    name: 'Palestine Solidarity',
    category: 'flag',
    icon: '🇵🇸',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #1a1a1a 0%, #006847 45%, #ce1126 100%)',
    accentColor: '#22c55e',
    textColor: 'light',
    headerOpacity: 0.92,
    description: 'Black, deep green, and crimson emblem tribute'
  },
  {
    name: 'Diwali Festival of Lights',
    category: 'festival',
    icon: '🪔',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #331005 0%, #6e250e 50%, #b44a10 100%)',
    accentColor: '#f97316',
    textColor: 'light',
    headerOpacity: 0.92,
    description: 'Warm festive glowing amber & deep ruby fireworks aesthetic'
  },
  {
    name: 'Cyberpunk Neon Matrix',
    category: 'style',
    icon: '⚡',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #06261a 0%, #0b4f35 50%, #00a86b 100%)',
    accentColor: '#00ff88',
    textColor: 'light',
    headerOpacity: 0.9,
    description: 'High-contrast synthetic emerald grid'
  },
  {
    name: 'Deep Aurora Borealis',
    category: 'style',
    icon: '🌌',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #0a2540 0%, #007791 50%, #4f46e5 100%)',
    accentColor: '#38bdf8',
    textColor: 'light',
    headerOpacity: 0.92,
    description: 'Cosmic arctic curtains in cyan and indigo'
  },
  {
    name: 'Sakura Spring Blossom',
    category: 'festival',
    icon: '🌸',
    type: 'gradient',
    mediaUrl: '',
    backgroundColor: 'linear-gradient(90deg, #2e1022 0%, #631d47 50%, #9d2e70 100%)',
    accentColor: '#f472b6',
    textColor: 'light',
    headerOpacity: 0.92,
    description: 'Delicate Japanese cherry blossom magenta'
  }
]

export const ThemeStudio: React.FC<ThemeStudioProps> = ({ currentTheme, onPublishSuccess }) => {
  const [themeType, setThemeType] = useState<'gradient' | 'image' | 'gif' | 'color'>(
    currentTheme?.type || 'gradient'
  )
  const [themeName, setThemeName] = useState<string>(currentTheme?.name || 'Custom Theme')
  const [mediaUrl, setMediaUrl] = useState<string>(currentTheme?.mediaUrl || '')
  const [backgroundColor, setBackgroundColor] = useState<string>(
    currentTheme?.backgroundColor || 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)'
  )
  const [accentColor, setAccentColor] = useState<string>(currentTheme?.accentColor || '#10b981')
  const [textColor, setTextColor] = useState<'light' | 'dark'>(currentTheme?.textColor || 'light')
  const [headerOpacity, setHeaderOpacity] = useState<number>(currentTheme?.headerOpacity ?? 0.9)
  const [publishing, setPublishing] = useState<boolean>(false)
  const [publishMessage, setPublishMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync with current published theme when loaded
  useEffect(() => {
    if (currentTheme) {
      setThemeType(currentTheme.type)
      setThemeName(currentTheme.name)
      setMediaUrl(currentTheme.mediaUrl || '')
      setBackgroundColor(currentTheme.backgroundColor || '#090a0d')
      setAccentColor(currentTheme.accentColor || '#10b981')
      setTextColor(currentTheme.textColor || 'light')
      setHeaderOpacity(currentTheme.headerOpacity ?? 0.9)
    }
  }, [currentTheme])

  // Handle local image or GIF upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max 1.2 MB for base64 storage
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Image file size exceeds 1.5 MB limit. Please choose an optimized GIF or image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setMediaUrl(result)
      const isGif = file.type === 'image/gif' || file.name.endsWith('.gif')
      setThemeType(isGif ? 'gif' : 'image')
      setThemeName(file.name.replace(/\.[^/.]+$/, ''))
    }
    reader.readAsDataURL(file)
  }

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetThemeOption) => {
    setThemeType(preset.type)
    setThemeName(preset.name)
    setMediaUrl(preset.mediaUrl)
    setBackgroundColor(preset.backgroundColor)
    setAccentColor(preset.accentColor)
    setTextColor(preset.textColor)
    setHeaderOpacity(preset.headerOpacity)
    setPublishMessage(null)
  }

  // Publish to Cloud Firestore
  const handlePublish = async () => {
    setPublishing(true)
    setPublishMessage(null)

    try {
      const themePayload: BrowserTheme = {
        id: 'active_theme',
        name: themeName || 'Cairn Custom Theme',
        type: themeType,
        mediaUrl: mediaUrl.trim(),
        backgroundColor: backgroundColor.trim(),
        accentColor: accentColor.trim(),
        textColor,
        headerOpacity,
        updatedAt: Date.now(),
        updatedBy: 'Admin (Tareq)',
        isPublished: true
      }

      await setDoc(doc(db, 'browser_theme', 'active_theme'), themePayload)

      setPublishMessage({
        text: `✓ Successfully published "${themePayload.name}" to all Cairn Browsers live!`,
        type: 'success'
      })
      if (onPublishSuccess) onPublishSuccess(themePayload)
    } catch (err: any) {
      console.error('Failed to publish theme:', err)
      setPublishMessage({
        text: `Error publishing theme: ${err.message}`,
        type: 'error'
      })
    } finally {
      setPublishing(false)
    }
  }

  // Reset to default
  const handleResetToDefault = async () => {
    if (!window.confirm('Reset browser header theme to Cairn default dark style for all users?')) return
    setPublishing(true)
    try {
      const defaultTheme: BrowserTheme = {
        id: 'active_theme',
        name: 'Default Cairn Dark',
        type: 'color',
        mediaUrl: '',
        backgroundColor: '#101217',
        accentColor: '#10b981',
        textColor: 'light',
        headerOpacity: 1.0,
        updatedAt: Date.now(),
        updatedBy: 'Admin',
        isPublished: false
      }
      await setDoc(doc(db, 'browser_theme', 'active_theme'), defaultTheme)
      handleSelectPreset({
        name: 'Default Cairn Dark',
        category: 'style',
        icon: '🌌',
        type: 'color',
        mediaUrl: '',
        backgroundColor: '#101217',
        accentColor: '#10b981',
        textColor: 'light',
        headerOpacity: 1.0,
        description: 'Standard sleek dark interface'
      })
      setPublishMessage({ text: '✓ Reverted to Default Cairn theme.', type: 'success' })
    } catch (err: any) {
      alert(`Failed to reset theme: ${err.message}`)
    } finally {
      setPublishing(false)
    }
  }

  // Construct preview background style
  const headerPreviewStyle: React.CSSProperties = {
    backgroundColor: backgroundColor.startsWith('linear') ? undefined : backgroundColor,
    backgroundImage: mediaUrl
      ? `url("${mediaUrl}")`
      : backgroundColor.startsWith('linear')
      ? backgroundColor
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'right top',
    backgroundRepeat: 'no-repeat',
    color: textColor === 'light' ? '#f1f5f9' : '#0f172a'
  }

  return (
    <div className="theme-studio">
      <div className="theme-studio-header">
        <div>
          <h2 className="studio-title">Cairn Browser Theme Studio</h2>
          <p className="studio-desc">
            Design, upload, and broadcast customized themes, flags, and animated GIFs to the Cairn Browser header across all installed devices (just like Firefox Personas).
          </p>
        </div>

        <div className="studio-actions">
          <button
            type="button"
            className="btn-studio-reset"
            onClick={handleResetToDefault}
            disabled={publishing}
            title="Reset to default dark browser header"
          >
            Reset Default
          </button>
          <button
            id="btn-publish-theme"
            type="button"
            className="btn-studio-publish"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : '✦ Publish Theme to All Browsers'}
          </button>
        </div>
      </div>

      {publishMessage && (
        <div className={`theme-alert is-${publishMessage.type}`}>
          {publishMessage.text}
        </div>
      )}

      {/* Live Browser Chrome Preview (As shown in User Screenshot #2) */}
      <div className="theme-preview-card">
        <div className="preview-card-header">
          <div className="preview-card-title">
            <span className="live-dot" />
            <span>LIVE BROWSER HEADER PREVIEW (Screenshot 2 Match)</span>
          </div>
          <span className="preview-badge">
            {themeType.toUpperCase()} • {themeName}
          </span>
        </div>

        <div className="cairn-mock-browser">
          {/* Simulated Window Frame */}
          <div className="mock-window-topbar">
            <div className="mock-window-brand">
              <span className="mock-cairn-gem">✦</span>
              <span className="mock-cairn-title">Cairn</span>
            </div>
            <div className="mock-window-controls">
              <span>─</span>
              <span>□</span>
              <span>✕</span>
            </div>
          </div>

          {/* THE EXACT BROWSER-HEADER FROM SCREENSHOT 2 */}
          <div className="mock-browser-header" style={headerPreviewStyle}>
            {/* Header Overlay for readability */}
            <div
              className="mock-header-tint"
              style={{
                backgroundColor: textColor === 'light' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.25)',
                opacity: 1 - headerOpacity * 0.5
              }}
            />

            {/* Tab Bar Strip */}
            <div className="mock-tabbar">
              <div 
                className="mock-tab is-active"
                style={{
                  borderBottomColor: accentColor,
                  color: textColor === 'light' ? '#ffffff' : '#0f172a'
                }}
              >
                <span className="mock-tab-icon" style={{ color: accentColor }}>✦</span>
                <span className="mock-tab-title">New Tab</span>
                <span className="mock-tab-close">✕</span>
              </div>
              <button 
                type="button" 
                className="mock-new-tab-btn" 
                style={{ color: textColor === 'light' ? '#e2e8f0' : '#334155' }}
              >
                +
              </button>
            </div>

            {/* Toolbar & Omnibox */}
            <div className="mock-toolbar">
              <div className="mock-nav-btns">
                <button type="button" className="mock-nav-btn">‹</button>
                <button type="button" className="mock-nav-btn">›</button>
                <button type="button" className="mock-nav-btn">⟳</button>
                <button type="button" className="mock-nav-btn">⌂</button>
              </div>

              {/* Address / Search Bar */}
              <div className="mock-omnibox">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="mock-omnibox-text">Search or enter address</span>
              </div>

              {/* Action Icons */}
              <div className="mock-toolbar-actions">
                <span title="Extensions">🧩</span>
                <span title="Shield">🛡️</span>
                <span title="Aurora AI" style={{ color: accentColor }}>✨</span>
                <div className="mock-user-avatar">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=cairn" alt="" />
                </div>
                <span title="Menu">⋮</span>
              </div>
            </div>
          </div>

          <div className="mock-viewport-blank">
            <span>Browser Viewport (Tabs load below header)</span>
          </div>
        </div>
      </div>

      {/* Theme Studio Controls Grid */}
      <div className="theme-controls-grid">
        {/* Left Column: Preset Library */}
        <div className="theme-panel">
          <div className="panel-header">
            <h3>Preset Themes &amp; Flags</h3>
            <span className="panel-tag">Quick Apply</span>
          </div>
          <p className="panel-subtitle">Select festival celebration, flag, or gradient to test immediately:</p>

          <div className="presets-list">
            {PRESET_THEMES.map((preset) => {
              const isSelected = themeName === preset.name
              return (
                <div
                  key={preset.name}
                  className={`preset-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div className="preset-icon-col">
                    <span className="preset-emoji">{preset.icon}</span>
                  </div>
                  <div className="preset-info-col">
                    <div className="preset-name-row">
                      <span className="preset-title">{preset.name}</span>
                      <span className="preset-cat">{preset.category}</span>
                    </div>
                    <span className="preset-desc">{preset.description}</span>
                  </div>
                  <div 
                    className="preset-swatch"
                    style={{ background: preset.backgroundColor, border: `2px solid ${preset.accentColor}` }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Upload Custom GIF / Image & Color Fine-Tuning */}
        <div className="theme-panel">
          <div className="panel-header">
            <h3>Upload Custom Theme (GIF / Image / Color)</h3>
            <span className="panel-tag">Customizer</span>
          </div>

          <div className="customizer-form">
            {/* Theme Name */}
            <div className="form-group">
              <label>Theme Name</label>
              <input
                id="theme-name-input"
                type="text"
                className="studio-input"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g. Eid Lights, Neon Wave, Bangladesh Flag"
              />
            </div>

            {/* Media Upload Area */}
            <div className="form-group">
              <label>Header Artwork (Animated GIF, PNG, JPG, WebP)</label>
              <div 
                className="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/gif,image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                />
                {mediaUrl ? (
                  <div className="upload-preview-active">
                    <img src={mediaUrl} alt="Theme preview" className="dropzone-thumb" />
                    <div className="dropzone-text">
                      <strong>File Selected</strong>
                      <span>Click to change image or GIF</span>
                    </div>
                    <button 
                      type="button" 
                      className="dropzone-clear"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMediaUrl('')
                      }}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <strong>Click to upload GIF or Image</strong>
                    <span>Supports animated .GIF, .PNG, .JPG (Max 1.5MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Or Image URL */}
            <div className="form-group">
              <label>Or Web Image / GIF URL</label>
              <input
                id="theme-url-input"
                type="text"
                className="studio-input"
                value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value)
                  if (e.target.value.endsWith('.gif')) setThemeType('gif')
                  else if (e.target.value) setThemeType('image')
                }}
                placeholder="https://example.com/banner.gif or image URL"
              />
            </div>

            {/* Background Color / CSS Gradient */}
            <div className="form-group">
              <label>Background Color / CSS Gradient</label>
              <div className="color-input-row">
                <input
                  type="text"
                  className="studio-input"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#0f172a or linear-gradient(...)"
                />
                <input
                  type="color"
                  className="color-picker-input"
                  value={backgroundColor.startsWith('#') && backgroundColor.length === 7 ? backgroundColor : '#101217'}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>

            {/* Accent Color & Text Mode */}
            <div className="form-row-2">
              <div className="form-group">
                <label>Tab Active Accent Color</label>
                <div className="color-input-row">
                  <input
                    type="text"
                    className="studio-input"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                  <input
                    type="color"
                    className="color-picker-input"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Text Contrast</label>
                <select
                  className="studio-select"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value as any)}
                >
                  <option value="light">Light Text (For dark/vibrant themes)</option>
                  <option value="dark">Dark Text (For bright/white themes)</option>
                </select>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="form-group">
              <div className="slider-label-row">
                <label>Header Overlay Tint</label>
                <span>{Math.round(headerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                className="studio-slider"
                value={headerOpacity}
                onChange={(e) => setHeaderOpacity(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
