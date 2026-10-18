export const STORAGE_KEY = 'jobtrack.applications.v1'
export const THEME_KEY = 'jobtrack.theme'

export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']

const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const daysAhead = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function createDemoApplications() {
  return [
    {
      id: 'demo-1',
      company: 'Stripe',
      role: 'Software Engineer, New Grad',
      location: 'Remote · US',
      salary: '$125k – $155k',
      url: 'https://stripe.com/jobs',
      applicationDate: daysAgo(2),
      status: 'Interview',
      notes: 'Recruiter screen went well. Brush up on API design.',
      interviewDate: daysAhead(2),
    },
    {
      id: 'demo-2',
      company: 'Notion',
      role: 'Associate Product Designer',
      location: 'San Francisco, CA',
      salary: '$95k – $120k',
      url: 'https://www.notion.so/careers',
      applicationDate: daysAgo(4),
      status: 'Applied',
      notes: 'Tailored portfolio for the productivity team.',
      interviewDate: '',
    },
    {
      id: 'demo-3',
      company: 'Figma',
      role: 'Frontend Engineer, University Grad',
      location: 'New York, NY',
      salary: '$130k – $165k',
      url: 'https://www.figma.com/careers/',
      applicationDate: daysAgo(7),
      status: 'Offer',
      notes: 'Offer received! Review the equity and benefits package.',
      interviewDate: '',
    },
    {
      id: 'demo-4',
      company: 'Linear',
      role: 'Product Engineer',
      location: 'Remote',
      salary: '$110k – $145k',
      url: 'https://linear.app/careers',
      applicationDate: daysAgo(9),
      status: 'Interview',
      notes: 'Take-home assignment submitted.',
      interviewDate: daysAhead(5),
    },
    {
      id: 'demo-5',
      company: 'Webflow',
      role: 'Associate Software Engineer',
      location: 'Remote · US',
      salary: '$100k – $130k',
      url: 'https://webflow.com/careers',
      applicationDate: daysAgo(12),
      status: 'Rejected',
      notes: 'Keep going — the right one is out there.',
      interviewDate: '',
    },
    {
      id: 'demo-6',
      company: 'Vercel',
      role: 'Frontend Developer',
      location: 'Remote',
      salary: '$115k – $150k',
      url: 'https://vercel.com/careers',
      applicationDate: daysAgo(16),
      status: 'Applied',
      notes: '',
      interviewDate: '',
    },
    {
      id: 'demo-7',
      company: 'Airtable',
      role: 'Software Engineer Intern',
      location: 'Austin, TX',
      salary: '$42 – $55 / hr',
      url: 'https://airtable.com/careers',
      applicationDate: daysAgo(20),
      status: 'Wishlist',
      notes: 'Check back after updating my project portfolio.',
      interviewDate: '',
    },
  ]
}

export function readApplications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) {
      const applications = createDemoApplications()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
      return { applications, error: '' }
    }
    const applications = JSON.parse(stored)
    if (!Array.isArray(applications) || !applications.every(isApplication)) {
      throw new Error('Saved application data is not a valid application list.')
    }
    return { applications, error: '' }
  } catch (error) {
    return {
      applications: createDemoApplications(),
      error: `Saved data could not be read. Your demo workspace is shown instead. ${error.message}`,
    }
  }
}

export function isApplication(value) {
  const validShape = Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.id === 'string' &&
      typeof value.company === 'string' &&
      typeof value.role === 'string' &&
      typeof value.applicationDate === 'string' &&
      STATUSES.includes(value.status) &&
      ['location', 'salary', 'url', 'notes', 'interviewDate'].every(
        (field) => value[field] === undefined || typeof value[field] === 'string',
      ),
  )
  if (!validShape || !value.url) return validShape
  try {
    return ['http:', 'https:'].includes(new URL(value.url).protocol)
  } catch {
    return false
  }
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return 'Not set'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Not set'
  return new Intl.DateTimeFormat(undefined, options).format(date)
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
