import { api } from './api'

const statusLabelMap = {
  reported: 'Reported',
  verified: 'Verified',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  closed: 'Closed',
  blocked: 'Blocked',
}

export const issueStatusOptions = [
  { value: 'reported', label: 'Reported' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
  { value: 'blocked', label: 'Blocked' },
]

export function getIssueStatusLabel(status) {
  return statusLabelMap[status] || status || 'reported'
}

function normalizeIssue(issue) {
  const attachments = Array.isArray(issue?.attachments) ? issue.attachments : []

  return {
    ...issue,
    status: issue?.status || 'reported',
    statusLabel: getIssueStatusLabel(issue?.status),
    verificationStatus: issue?.verification_status || 'pending',
    latitude: issue?.lat ?? null,
    longitude: issue?.lng ?? null,
    images: attachments.map((attachment) => attachment.file_url).filter(Boolean),
  }
}

export async function listIssues({ organizationId } = {}) {
  const params = new URLSearchParams()
  if (organizationId) params.set('organization_id', organizationId)

  const suffix = params.toString() ? `?${params.toString()}` : ''
  const data = await api.get(`/issues${suffix}`)
  return (data?.issues ?? []).map(normalizeIssue)
}

export async function getIssueById(issueId) {
  const data = await api.get(`/issues/${issueId}`)
  return normalizeIssue(data?.issue)
}

export async function updateIssue(issueId, patch) {
  console.log('[issuesService] updateIssue called', { issueId, patch })
  const normalizedPatch = {}

  if (patch?.status !== undefined) {
    normalizedPatch.status = patch.status

    if (patch.status === 'verified' && patch.verification_status === undefined) {
      normalizedPatch.verification_status = 'authority_verified'
    }
  }

  if (patch?.verification_status !== undefined) {
    normalizedPatch.verification_status = patch.verification_status
  }

  if (patch?.assigned_to !== undefined) {
    normalizedPatch.assigned_to = patch.assigned_to
  }

  console.log('[issuesService] normalized patch', { normalizedPatch })
  const data = await api.patch(`/issues/${issueId}`, normalizedPatch)
  console.log('[issuesService] api response', { data })
  const result = normalizeIssue(data?.issue)
  console.log('[issuesService] normalized result', { status: result?.status })
  return result
}

export async function getIssueStats() {
  const rows = await listIssues()

  const total = rows.length
  const byStatus = rows.reduce((acc, row) => {
    const key = row.status || 'reported'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const open =
    (byStatus.reported || 0) +
    (byStatus.verified || 0) +
    (byStatus.in_progress || 0) +
    (byStatus.review || 0)

  const resolved = (byStatus.completed || 0) + (byStatus.closed || 0)

  return { total, open, resolved, byStatus }
}

