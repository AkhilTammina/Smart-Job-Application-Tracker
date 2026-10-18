import { useEffect, useMemo, useState } from 'react'
import {
  formatDate,
  initials,
  isApplication,
  readApplications,
  STATUSES,
  STORAGE_KEY,
  THEME_KEY,
} from './data'
import './App.css'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'applications', label: 'Applications', icon: 'briefcase' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const STATUS_COLORS = {
  Wishlist: '#9a9ba7',
  Applied: '#5886ee',
  Interview: '#eaa83b',
  Offer: '#37a77b',
  Rejected: '#e16e75',
}

const APP_TODAY = new Date()
const APP_TODAY_ISO = `${APP_TODAY.getFullYear()}-${String(APP_TODAY.getMonth() + 1).padStart(2, '0')}-${String(APP_TODAY.getDate()).padStart(2, '0')}`
const ACTIVITY_MONTHS = Array.from({ length: 6 }, (_, index) => {
  const date = new Date(APP_TODAY.getFullYear(), APP_TODAY.getMonth() - (5 - index), 1)
  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    label: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
  }
})

function Icon({ name, size = 18, ...props }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z" transform="translate(-1 -1)" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-0.8 4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  )
}

function Modal({ title, onClose, children, size = '' }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal-card ${size}`}
        role="dialog"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function ApplicationForm({ application, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    company: application?.company ?? '',
    role: application?.role ?? '',
    location: application?.location ?? '',
    salary: application?.salary ?? '',
    url: application?.url ?? '',
    applicationDate: application?.applicationDate ?? new Date().toISOString().slice(0, 10),
    status: application?.status ?? 'Applied',
    notes: application?.notes ?? '',
    interviewDate: application?.interviewDate ?? '',
  }))
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.company.trim() || !form.role.trim() || !form.applicationDate) {
      setError('Company, role, and application date are required.')
      return
    }
    if (form.url.trim()) {
      try {
        const url = new URL(form.url.trim())
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid URL protocol')
      } catch {
        setError('Enter a valid job link starting with http:// or https://.')
        return
      }
    }
    onSave({
      ...form,
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      salary: form.salary.trim(),
      url: form.url.trim(),
      notes: form.notes.trim(),
    })
  }

  return (
    <Modal onClose={onClose} title={application ? 'Edit application' : 'Add application'} size="modal-wide">
      <form className="application-form" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Company <span className="required">*</span>
            <input autoFocus maxLength="100" onChange={(e) => update('company', e.target.value)} placeholder="e.g. Acme Inc." value={form.company} />
          </label>
          <label>
            Role <span className="required">*</span>
            <input maxLength="120" onChange={(e) => update('role', e.target.value)} placeholder="e.g. Junior Product Designer" value={form.role} />
          </label>
          <label>
            Job location
            <input maxLength="120" onChange={(e) => update('location', e.target.value)} placeholder="Remote, New York, NY" value={form.location} />
          </label>
          <label>
            Salary range
            <input maxLength="80" onChange={(e) => update('salary', e.target.value)} placeholder="e.g. $80k – $100k" value={form.salary} />
          </label>
          <label>
            Application date <span className="required">*</span>
            <input onChange={(e) => update('applicationDate', e.target.value)} type="date" value={form.applicationDate} />
          </label>
          <label>
            Status
            <select onChange={(e) => update('status', e.target.value)} value={form.status}>
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Job URL
            <input inputMode="url" maxLength="500" onChange={(e) => update('url', e.target.value)} placeholder="https://company.com/careers/role" value={form.url} />
          </label>
          <label>
            Interview date
            <input onChange={(e) => update('interviewDate', e.target.value)} type="date" value={form.interviewDate} />
          </label>
          <label className="full-field">
            Notes
            <textarea maxLength="2000" onChange={(e) => update('notes', e.target.value)} placeholder="People to follow up with, interview prep, or anything worth remembering…" rows="3" value={form.notes} />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" onClick={onClose} type="button">Cancel</button>
          <button className="button button-primary" type="submit">{application ? 'Save changes' : 'Add application'}</button>
        </div>
      </form>
    </Modal>
  )
}

function ApplicationDetails({ application, onClose, onEdit, onDelete }) {
  return (
    <Modal onClose={onClose} title="Application details">
      <div className="detail-company">
        <div className="company-avatar avatar-large">{initials(application.company)}</div>
        <div>
          <h3>{application.company}</h3>
          <p>{application.role}</p>
        </div>
      </div>
      <div className="detail-status"><StatusBadge status={application.status} /></div>
      <dl className="detail-grid">
        <div><dt>Applied on</dt><dd>{formatDate(application.applicationDate)}</dd></div>
        <div><dt>Interview date</dt><dd>{formatDate(application.interviewDate)}</dd></div>
        <div><dt>Location</dt><dd>{application.location || 'Not specified'}</dd></div>
        <div><dt>Salary</dt><dd>{application.salary || 'Not specified'}</dd></div>
        {application.url && <div className="full-field"><dt>Job listing</dt><dd><a className="detail-link" href={application.url} rel="noreferrer" target="_blank">{application.url}<Icon name="arrow" size={14} /></a></dd></div>}
        <div className="full-field"><dt>Notes</dt><dd className="detail-notes">{application.notes || 'No notes yet.'}</dd></div>
      </dl>
      <div className="modal-actions detail-actions">
        <button className="button button-danger-quiet" onClick={() => onDelete(application)} type="button"><Icon name="trash" size={16} /> Delete</button>
        <span className="action-spacer" />
        <button className="button button-quiet" onClick={onClose} type="button">Close</button>
        <button className="button button-primary" onClick={() => onEdit(application)} type="button"><Icon name="edit" size={15} /> Edit</button>
      </div>
    </Modal>
  )
}

function Confirmation({ title, message, confirmLabel, onCancel, onConfirm, danger = false }) {
  return (
    <Modal onClose={onCancel} title={title}>
      <div className="confirm-body">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button button-quiet" onClick={onCancel} type="button">Cancel</button>
          <button className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={onConfirm} type="button">{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  )
}

function ApplicationTable({ applications, onView, onEdit, onDelete, compact = false }) {
  if (!applications.length) return null
  return (
    <div className="table-wrap">
      <table className={compact ? 'application-table compact-table' : 'application-table'}>
        <thead>
          <tr><th>Company & role</th><th>Status</th><th>Applied</th><th className="table-actions-heading">Actions</th></tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>
                <button className="company-cell" onClick={() => onView(application)} type="button">
                  <span className="company-avatar">{initials(application.company)}</span>
                  <span className="company-info"><strong>{application.company}</strong><span>{application.role}</span></span>
                </button>
              </td>
              <td><StatusBadge status={application.status} /></td>
              <td className="date-cell">{formatDate(application.applicationDate, { month: 'short', day: 'numeric' })}</td>
              <td>
                <div className="row-actions">
                  <button aria-label={`View ${application.company}`} className="icon-button small-icon" onClick={() => onView(application)} title="View details" type="button"><Icon name="arrow" size={16} /></button>
                  <button aria-label={`Edit ${application.company}`} className="icon-button small-icon" onClick={() => onEdit(application)} title="Edit" type="button"><Icon name="edit" size={15} /></button>
                  <button aria-label={`Delete ${application.company}`} className="icon-button small-icon delete-icon" onClick={() => onDelete(application)} title="Delete" type="button"><Icon name="trash" size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ onAdd, filtered = false }) {
  return (
    <div className="empty-state">
      <div className="empty-illustration"><Icon name={filtered ? 'search' : 'briefcase'} size={25} /></div>
      <h3>{filtered ? 'No matching applications' : 'Your next opportunity starts here'}</h3>
      <p>{filtered ? 'Try a different search or adjust your filters.' : 'Keep all your job applications organized in one place.'}</p>
      {!filtered && <button className="button button-primary" onClick={onAdd} type="button"><Icon name="plus" size={16} /> Add your first application</button>}
    </div>
  )
}

function StatusChart({ applications }) {
  const counts = STATUSES.map((status) => ({
    status,
    count: applications.filter((item) => item.status === status).length,
  }))
  const total = applications.length
  let position = 0
  const segments = counts.map(({ status, count }) => {
    const start = position
    position += total ? (count / total) * 100 : 0
    return `${STATUS_COLORS[status]} ${start}% ${position}%`
  })

  return (
    <div className="status-chart-layout">
      <div aria-label={`Status distribution for ${total} applications`} className={`donut-chart ${total ? '' : 'donut-empty'}`} role="img" style={{ background: total ? `conic-gradient(${segments.join(', ')})` : undefined }}>
        <div className="donut-center"><strong>{total}</strong><span>Total</span></div>
      </div>
      <div className="chart-legend">
        {counts.map(({ status, count }) => (
          <div className="legend-row" key={status}>
            <span className="legend-label"><i style={{ backgroundColor: STATUS_COLORS[status] }} />{status}</span>
            <span className="legend-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityChart({ applications }) {
  const data = ACTIVITY_MONTHS.map(({ key, label }) => {
    return {
      label,
      count: applications.filter((item) => item.applicationDate?.startsWith(key)).length,
    }
  })
  const max = Math.max(4, ...data.map((point) => point.count))
  const points = data.map((point, index) => `${34 + index * 72},${150 - (point.count / max) * 112}`).join(' ')
  const area = `34,150 ${points} 394,150`

  return (
    <div className="activity-chart">
      <div className="chart-y-labels"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div>
      <svg aria-label="Applications submitted by month over the last six months" role="img" viewBox="0 0 420 180">
        <defs><linearGradient id="activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6558e8" stopOpacity=".2" /><stop offset="100%" stopColor="#6558e8" stopOpacity="0" /></linearGradient></defs>
        <path d="M34 38H404M34 94H404M34 150H404" className="chart-gridline" />
        <polygon points={area} fill="url(#activity-fill)" />
        <polyline points={points} className="activity-line" />
        {data.map((point, index) => {
          const x = 34 + index * 72
          const y = 150 - (point.count / max) * 112
          return <g key={point.label}><circle className="activity-point" cx={x} cy={y} r="4" /><text className="chart-x-label" textAnchor="middle" x={x} y="173">{point.label}</text></g>
        })}
      </svg>
    </div>
  )
}

function StatCard({ icon, label, value, detail, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon name={icon} size={19} /></div>
      <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  )
}

function App() {
  const [initialData] = useState(readApplications)
  const [applications, setApplications] = useState(initialData.applications)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })
  const [page, setPage] = useState('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [sortOrder, setSortOrder] = useState('newest')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState(initialData.error ? { type: 'error', message: initialData.error } : null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!notice || notice.type === 'error') return undefined
    const timeout = window.setTimeout(() => setNotice(null), 3800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase()
    return applications
      .filter((application) => {
        const matchesSearch = !term || `${application.company} ${application.role}`.toLowerCase().includes(term)
        const matchesStatus = statusFilter === 'All statuses' || application.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => sortOrder === 'newest'
        ? b.applicationDate.localeCompare(a.applicationDate)
        : a.applicationDate.localeCompare(b.applicationDate))
  }, [applications, search, statusFilter, sortOrder])

  const upcomingInterviews = useMemo(() => {
    return applications
      .filter((application) => application.status === 'Interview' && application.interviewDate && application.interviewDate >= APP_TODAY_ISO)
      .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate))
      .slice(0, 3)
  }, [applications])

  const total = applications.length
  const submittedCount = applications.filter((item) => item.status !== 'Wishlist').length
  const interviewCount = applications.filter((item) => item.status === 'Interview').length
  const offerCount = applications.filter((item) => item.status === 'Offer').length
  const rejectedCount = applications.filter((item) => item.status === 'Rejected').length
  const repliedCount = applications.filter((item) => ['Interview', 'Offer', 'Rejected'].includes(item.status)).length
  const responseRate = submittedCount ? Math.round((repliedCount / submittedCount) * 100) : 0
  const pageTitle = NAV_ITEMS.find((item) => item.id === page)?.label || 'Overview'

  function showNotice(message, type = 'success') {
    setNotice({ message, type })
  }

  function commitApplications(nextApplications, successMessage) {
    setApplications(nextApplications)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextApplications))
      if (successMessage) showNotice(successMessage)
    } catch {
      showNotice('Changes are visible but could not be saved. Check your browser storage settings.', 'error')
    }
  }

  function updateTheme(nextTheme) {
    setTheme(nextTheme)
    try {
      localStorage.setItem(THEME_KEY, nextTheme)
    } catch {
      showNotice('Your theme preference could not be saved in this browser.', 'error')
    }
  }

  function saveApplication(fields) {
    if (modal?.type === 'edit') {
      commitApplications(
        applications.map((item) => item.id === modal.application.id ? { ...item, ...fields } : item),
        'Application updated successfully.',
      )
    } else {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `application-${Date.now()}-${Math.random().toString(36).slice(2)}`
      commitApplications([{ ...fields, id }, ...applications], 'Application added successfully.')
    }
    setModal(null)
  }

  function openDelete(application) {
    setModal({ type: 'delete', application })
  }

  function deleteApplication() {
    commitApplications(
      applications.filter((item) => item.id !== modal.application.id),
      `${modal.application.company} application deleted.`,
    )
    setModal(null)
  }

  function editApplication(application) {
    setModal({ type: 'edit', application })
  }

  function viewApplication(application) {
    setModal({ type: 'details', application })
  }

  function navigate(nextPage) {
    setPage(nextPage)
    setMobileNavOpen(false)
    setSearch('')
    setStatusFilter('All statuses')
  }

  function exportData() {
    const contents = JSON.stringify({ exportedAt: new Date().toISOString(), applications }, null, 2)
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `jobtrack-applications-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    showNotice('Your applications have been exported.')
  }

  async function importData(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const items = Array.isArray(parsed) ? parsed : parsed.applications
      if (!Array.isArray(items) || !items.every(isApplication)) {
        throw new Error('The file must contain a list of valid JobTrack applications.')
      }
      setModal({ type: 'import', applications: items })
    } catch (error) {
      showNotice(error.message || 'The selected file could not be imported.', 'error')
    }
  }

  function confirmImport() {
    const uniqueItems = modal.applications.map((item) => ({
      ...item,
      location: item.location || '',
      salary: item.salary || '',
      url: item.url || '',
      notes: item.notes || '',
      interviewDate: item.interviewDate || '',
    }))
    commitApplications(uniqueItems, `${uniqueItems.length} application${uniqueItems.length === 1 ? '' : 's'} imported.`)
    setModal(null)
  }

  function clearAll() {
    commitApplications([], 'All applications have been deleted.')
    setModal(null)
  }

  function renderPage() {
    if (page === 'applications') {
      const isFiltered = Boolean(search || statusFilter !== 'All statuses')
      return (
        <>
          <div className="page-heading applications-heading">
            <div><p className="eyebrow">YOUR JOB SEARCH</p><h1>Applications</h1><p className="page-subtitle">Every opportunity, organized and moving forward.</p></div>
            <button className="button button-primary" onClick={() => setModal({ type: 'add' })} type="button"><Icon name="plus" size={17} /> Add application</button>
          </div>
          <section className="panel applications-panel">
            <div className="list-toolbar">
              <div className="search-box"><Icon name="search" size={17} /><input aria-label="Search applications by company or role" onChange={(e) => setSearch(e.target.value)} placeholder="Search company or role…" value={search} /></div>
              <div className="toolbar-filters">
                <select aria-label="Filter by status" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                  <option>All statuses</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <select aria-label="Sort by application date" onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
                  <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
            {filteredApplications.length
              ? <ApplicationTable applications={filteredApplications} onDelete={openDelete} onEdit={editApplication} onView={viewApplication} />
              : <EmptyState filtered={isFiltered} onAdd={() => setModal({ type: 'add' })} />}
            <div className="table-footer">Showing <strong>{filteredApplications.length}</strong> of <strong>{total}</strong> applications</div>
          </section>
        </>
      )
    }

    if (page === 'analytics') {
      return (
        <>
          <div className="page-heading">
            <div><p className="eyebrow">YOUR MOMENTUM</p><h1>Analytics</h1><p className="page-subtitle">A clearer picture of your job search progress.</p></div>
          </div>
          <div className="analytics-summary">
            <StatCard detail="All tracked opportunities" icon="briefcase" label="Total applications" tone="purple" value={total} />
            <StatCard detail="Of applications sent" icon="arrow" label="Response rate" tone="blue" value={`${responseRate}%`} />
            <StatCard detail="Positive outcomes" icon="spark" label="Interviews & offers" tone="green" value={interviewCount + offerCount} />
          </div>
          <div className="analytics-grid">
            <section className="panel chart-panel"><div className="panel-heading"><div><h2>Application activity</h2><p>Applications submitted over the last 6 months</p></div><span className="chart-period">6 months</span></div><ActivityChart applications={applications} /></section>
            <section className="panel chart-panel"><div className="panel-heading"><div><h2>Application status</h2><p>Where things stand right now</p></div></div><StatusChart applications={applications} /></section>
          </div>
        </>
      )
    }

    if (page === 'settings') {
      return (
        <>
          <div className="page-heading"><div><p className="eyebrow">MAKE IT YOURS</p><h1>Settings</h1><p className="page-subtitle">Manage your preferences and keep your data safe.</p></div></div>
          <div className="settings-layout">
            <section className="panel settings-panel">
              <div className="settings-section-heading"><div className="settings-icon"><Icon name="sun" /></div><div><h2>Appearance</h2><p>Choose the look that feels right for you.</p></div></div>
              <div className="theme-picker">
                  <button aria-pressed={theme === 'light'} className={`theme-option ${theme === 'light' ? 'selected' : ''}`} onClick={() => updateTheme('light')} type="button"><span className="theme-preview theme-preview-light"><i /><i /><i /></span><span><strong>Light</strong><small>Bright and focused</small></span>{theme === 'light' && <Icon className="theme-check" name="check" size={17} />}</button>
                  <button aria-pressed={theme === 'dark'} className={`theme-option ${theme === 'dark' ? 'selected' : ''}`} onClick={() => updateTheme('dark')} type="button"><span className="theme-preview theme-preview-dark"><i /><i /><i /></span><span><strong>Dark</strong><small>Easy on the eyes</small></span>{theme === 'dark' && <Icon className="theme-check" name="check" size={17} />}</button>
              </div>
            </section>
            <section className="panel settings-panel">
              <div className="settings-section-heading"><div className="settings-icon"><Icon name="download" /></div><div><h2>Your data</h2><p>Your applications live in this browser. Export a backup or restore a previous one.</p></div></div>
              <div className="data-summary"><span>{total} application{total === 1 ? '' : 's'} saved</span><span>Stored on this device</span></div>
              <div className="data-actions"><button className="button button-secondary" onClick={exportData} type="button"><Icon name="download" size={16} /> Export data</button><label className="button button-secondary file-button"><Icon name="upload" size={16} /> Import data<input accept=".json,application/json" onChange={importData} type="file" /></label></div>
            </section>
            <section className="panel settings-panel danger-zone">
              <div className="settings-section-heading"><div className="settings-icon danger-setting-icon"><Icon name="trash" /></div><div><h2>Clear all applications</h2><p>Remove every saved application from this browser. This can’t be undone.</p></div></div>
              <button className="button button-danger-quiet" disabled={!total} onClick={() => setModal({ type: 'clear' })} type="button"><Icon name="trash" size={16} /> Clear all data</button>
            </section>
            <div className="privacy-note"><Icon name="check" size={16} /><p>Your data stays private. JobTrack stores everything locally in your browser and does not send it to a server.</p></div>
          </div>
        </>
      )
    }

    return (
      <>
        <div className="welcome-banner">
          <div>
            <div className="welcome-kicker"><Icon name="spark" size={15} /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Good things are<br className="welcome-break" /> <span>in the works.</span></h1>
            <p>Stay on top of every opportunity. You’ve got this.</p>
            <button className="button welcome-button" onClick={() => setModal({ type: 'add' })} type="button"><Icon name="plus" size={16} /> Add an application</button>
          </div>
          <div aria-hidden="true" className="welcome-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sparkle sparkle-one">✦</div><div className="art-sparkle sparkle-two">✳</div><div className="art-card"><span className="art-card-logo">J</span><span><i /><i /><i /></span><span className="art-card-check"><Icon name="check" size={18} /></span></div><div className="art-pill">ONE STEP AT A TIME</div></div>
        </div>
        <div className="section-title-row"><div><h2>Your job search at a glance</h2><p>A little progress adds up to big things.</p></div><span className="date-chip"><Icon name="calendar" size={15} /> {new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(APP_TODAY)}</span></div>
        <div className="stats-grid">
          <StatCard detail="Across all statuses" icon="briefcase" label="Total applications" tone="purple" value={total} />
          <StatCard detail="Conversations started" icon="calendar" label="Interviews" tone="amber" value={interviewCount} />
          <StatCard detail="You’re getting there!" icon="spark" label="Offers" tone="green" value={offerCount} />
          <StatCard detail="On to the next one" icon="close" label="Rejections" tone="red" value={rejectedCount} />
          <StatCard detail="Of applications sent" icon="chart" label="Response rate" tone="blue" value={`${responseRate}%`} />
        </div>
        <div className="dashboard-grid">
          <section className="panel recent-panel">
            <div className="panel-heading"><div><h2>Recent applications</h2><p>Your latest moves, all in one place.</p></div><button className="text-button" onClick={() => navigate('applications')} type="button">View all <Icon name="chevron" size={15} /></button></div>
            {applications.length
              ? <ApplicationTable applications={[...applications].sort((a, b) => b.applicationDate.localeCompare(a.applicationDate)).slice(0, 5)} compact onDelete={openDelete} onEdit={editApplication} onView={viewApplication} />
              : <EmptyState onAdd={() => setModal({ type: 'add' })} />}
          </section>
          <section className="panel interviews-panel">
            <div className="panel-heading"><div><h2>Coming up</h2><p>Make a great impression.</p></div><span className="calendar-heading-icon"><Icon name="calendar" size={17} /></span></div>
            {upcomingInterviews.length
              ? <div className="interview-list">{upcomingInterviews.map((item) => {
                const date = new Date(`${item.interviewDate}T00:00:00`)
                return <button className="interview-item" key={item.id} onClick={() => viewApplication(item)} type="button"><span className="interview-date"><strong>{new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(date)}</strong><small>{new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date)}</small></span><span className="interview-info"><strong>{item.company}</strong><small>{item.role}</small><span><Icon name="clock" size={13} /> Interview scheduled</span></span><Icon className="interview-chevron" name="chevron" size={17} /></button>
              })}</div>
              : <div className="interview-empty"><div className="calendar-empty-icon"><Icon name="calendar" size={19} /></div><strong>Nothing on the calendar</strong><p>When you schedule an interview, it’ll show up here.</p></div>}
            <div className="interview-tip"><Icon name="spark" size={15} /><span>A little prep today goes a long way tomorrow.</span></div>
          </section>
        </div>
      </>
    )
  }

  return (
    <div className="app-shell">
      {mobileNavOpen && <button aria-label="Close navigation" className="sidebar-backdrop" onClick={() => setMobileNavOpen(false)} type="button" />}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <button aria-label="JobTrack home" className="brand" onClick={() => navigate('overview')} type="button"><span className="brand-mark"><span /><span /><span /></span><span>job<span>track</span></span></button>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="primary-nav">
          {NAV_ITEMS.map((item) => <button aria-current={page === item.id ? 'page' : undefined} className={`nav-link ${page === item.id ? 'nav-active' : ''}`} key={item.id} onClick={() => navigate(item.id)} type="button"><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'applications' && <span className="nav-count">{total}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-icon"><Icon name="spark" size={16} /></span><strong>Keep showing up.</strong><p>Your future self is already proud of you.</p><div className="tip-decoration">✳</div></div>
          <button className="profile-button" onClick={() => navigate('settings')} type="button"><span className="profile-avatar">JT</span><span className="profile-info"><strong>My workspace</strong><small>Personal account</small></span><Icon className="profile-chevron" name="chevron" size={15} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button aria-label="Open navigation" className="mobile-menu-button icon-button" onClick={() => setMobileNavOpen(true)} type="button"><Icon name="menu" size={21} /></button><div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{pageTitle}</strong></div></div>
          <div className="topbar-actions"><span className="topbar-greeting">Your job search is looking good <span>✦</span></span><button className="topbar-add button button-primary" onClick={() => setModal({ type: 'add' })} type="button"><Icon name="plus" size={16} /> Add application</button><button aria-label="Toggle dark theme" className="theme-toggle icon-button" onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle theme" type="button"><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><span className="topbar-avatar">A</span></div>
        </header>
        <div className={`page-content ${page === 'overview' ? 'overview-content' : ''}`}>
          {renderPage()}
          <footer className="app-footer"><span>Made for the next big thing.</span><span>JobTrack <span className="footer-dot">·</span> Your progress, in one place</span></footer>
        </div>
      </main>

      {notice && <div className={`toast toast-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}><span className="toast-icon"><Icon name={notice.type === 'error' ? 'close' : 'check'} size={15} /></span><span>{notice.message}</span>{notice.type === 'error' && <button aria-label="Dismiss notification" className="toast-close" onClick={() => setNotice(null)} type="button"><Icon name="close" size={15} /></button>}</div>}
      {modal?.type === 'add' && <ApplicationForm onClose={() => setModal(null)} onSave={saveApplication} />}
      {modal?.type === 'edit' && <ApplicationForm application={modal.application} onClose={() => setModal(null)} onSave={saveApplication} />}
      {modal?.type === 'details' && <ApplicationDetails application={modal.application} onClose={() => setModal(null)} onDelete={(application) => setModal({ type: 'delete', application })} onEdit={editApplication} />}
      {modal?.type === 'delete' && <Confirmation danger message={`This will permanently delete the ${modal.application.role} application at ${modal.application.company}.`} onCancel={() => setModal(null)} onConfirm={deleteApplication} title="Delete this application?" confirmLabel="Delete application" />}
      {modal?.type === 'clear' && <Confirmation danger message="This will permanently remove every application saved in this browser. This action cannot be undone." onCancel={() => setModal(null)} onConfirm={clearAll} title="Clear all applications?" confirmLabel="Clear all data" />}
      {modal?.type === 'import' && <Confirmation message={`Importing ${modal.applications.length} applications will replace your current ${total} saved application${total === 1 ? '' : 's'}.`} onCancel={() => setModal(null)} onConfirm={confirmImport} title="Replace saved applications?" confirmLabel="Import and replace" />}
    </div>
  )
}

export default App
