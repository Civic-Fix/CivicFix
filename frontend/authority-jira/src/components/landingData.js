export const navItems = [
  { label: 'Workflow', href: '#how-it-works' },
  { label: 'Platform', href: '#features' },
  { label: 'Impact', href: '#impact' },
]

export const issueCards = [
  {
    id: 1048,
    title: 'Pothole near school gate',
    status: 'High',
    progress: 'w-3/4',
    meta: 'Roads team assigned, site visit due today',
    area: 'MG Road',
    votes: 128,
  },
  {
    id: 1049,
    title: 'Garbage pickup missed',
    status: 'New',
    progress: 'w-1/2',
    meta: 'Auto-routed to sanitation queue',
    area: 'Lake View',
    votes: 94,
  },
  {
    id: 1050,
    title: 'Streetlight outage',
    status: 'Review',
    progress: 'w-2/3',
    meta: 'Field photo requested from technician',
    area: 'Sector 8',
    votes: 67,
  },
  {
    id: 1051,
    title: 'Blocked storm drain',
    status: 'Urgent',
    progress: 'w-4/5',
    meta: 'Escalated before rainfall alert',
    area: 'Market Lane',
    votes: 156,
  },
  {
    id: 1052,
    title: 'Broken park bench',
    status: 'Queued',
    progress: 'w-1/3',
    meta: 'Parks team notified',
    area: 'Green Park',
    votes: 41,
  },
  {
    id: 1053,
    title: 'Overflowing public bin',
    status: 'Active',
    progress: 'w-3/5',
    meta: 'Cleanup crew assigned',
    area: 'Bus Depot',
    votes: 89,
  },
]

export const steps = [
  {
    title: 'Intake',
    text: 'Receive citizen reports with photos, location, category, ward, urgency, and duplicate detection.',
    icon: 'camera',
  },
  {
    title: 'Triage',
    text: 'Prioritize cases by severity, public support, SLA risk, and department ownership before assignment.',
    icon: 'map',
  },
  {
    title: 'Resolve',
    text: 'Track field work, publish updates, verify fixes, and close the public loop with an auditable timeline.',
    icon: 'check',
  },
]

export const features = [
  {
    title: 'Structured complaint intake',
    text: 'Convert citizen posts into actionable cases with proof, geolocation, category, duplicate signals, and ward context.',
    icon: 'camera',
  },
  {
    title: 'Status timelines',
    text: 'Keep every issue moving through submitted, acknowledged, assigned, in progress, verified, and resolved states.',
    icon: 'clock',
  },
  {
    title: 'Community priority signals',
    text: 'Use upvotes, comments, repeat reports, and locality patterns to identify what residents need handled first.',
    icon: 'users',
  },
  {
    title: 'Authority dashboards',
    text: 'Monitor resolution rate, team workload, hotspots, SLA breaches, and department performance from one workspace.',
    icon: 'chart',
  },
]

export const stats = [
  { value: '42%', label: 'faster first response' },
  { value: '18k+', label: 'reports organized' },
  { value: '31', label: 'wards monitored' },
]

export const testimonials = [
  {
    quote:
      'Our team stopped losing complaints across calls, chats, and spreadsheets. CivicFix gave every report an owner and a timeline.',
    name: 'Ward Operations Desk',
    role: 'Municipal response team',
  },
  {
    quote:
      'Hotspots and public priority signals helped us decide what needed field action before the daily review meeting.',
    name: 'Zone Supervisor',
    role: 'Roads and sanitation',
  },
  {
    quote:
      'Residents could see acknowledgement and progress instead of filing the same complaint again and again.',
    name: 'Citizen Services Cell',
    role: 'Public grievance support',
  },
]
