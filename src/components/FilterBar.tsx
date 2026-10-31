import React from 'react'
import { StatusFilter, CategoryFilter, SeverityFilter } from '../types'

interface FilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  status: StatusFilter
  onStatusChange: (val: StatusFilter) => void
  category: CategoryFilter
  onCategoryChange: (val: CategoryFilter) => void
  severity: SeverityFilter
  onSeverityChange: (val: SeverityFilter) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  severity,
  onSeverityChange
}) => {
  return (
    <div className="control-bar" role="search" aria-label="Feedback Search and Filters">
      <div className="search-box-wrapper">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="admin-filter-search-input"
          type="text"
          className="search-input"
          placeholder="Filter by email, subject, ID, or keywords..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filters-group">
        <select
          id="admin-filter-status"
          className="filter-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          aria-label="Filter by Status"
        >
          <option value="all">Status: All</option>
          <option value="unread">Status: Unread</option>
          <option value="in_review">Status: In Review</option>
          <option value="resolved">Status: Resolved</option>
        </select>

        <select
          id="admin-filter-category"
          className="filter-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
          aria-label="Filter by Category"
        >
          <option value="all">Category: All</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="security">Security / Privacy</option>
          <option value="ui">UI / UX Design</option>
          <option value="general">General</option>
        </select>

        <select
          id="admin-filter-severity"
          className="filter-select"
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as SeverityFilter)}
          aria-label="Filter by Severity"
        >
          <option value="all">Severity: All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  )
}
