import { api } from './api'

const statusLabelMap = {
  reported: 'Reported',
  verified: 'Open',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Resolved',
  closed: 'Closed',
  blocked: 'Rejected',
}

function toDisplayStatus(status) {
  if (!status) return 'Open'
  return statusLabelMap[status] || status
}

function toBackendStatus(status) {
  return String(status)
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, '_')
}

function normalizeIssue(issue) {
  const attachments = Array.isArray(issue?.attachments) ? issue.attachments : []

  return {
    ...issue,
    status: toDisplayStatus(issue?.status),
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
  const normalizedPatch = {}

  if (patch?.status !== undefined) {
    normalizedPatch.status = toBackendStatus(patch.status)
  }

  if (patch?.assigned_to !== undefined) {
    normalizedPatch.assigned_to = patch.assigned_to
  }

  const data = await api.patch(`/issues/${issueId}`, normalizedPatch)
  return normalizeIssue(data?.issue)
}

export async function getIssueStats() {
  const rows = await listIssues()

  const total = rows.length
  const byStatus = rows.reduce((acc, row) => {
    const key = row.status || 'Open'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const open =
    (byStatus.Open || 0) +
    (byStatus.New || 0) +
    (byStatus.Reported || 0) +
    (byStatus['In Progress'] || 0) +
    (byStatus.Active || 0) +
    (byStatus.Review || 0)

  const resolved = (byStatus.Resolved || 0) + (byStatus.Closed || 0)

  return { total, open, resolved, byStatus }
}

