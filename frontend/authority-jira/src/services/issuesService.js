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

export function getIssueCategoryLabel(category) {
  return category
    ? String(category)
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Uncategorized'
}

function normalizeScore(score) {
  const numericScore = Number(score)
  return Number.isFinite(numericScore) ? numericScore : null
}

function normalizeIssue(issue) {
  const attachments = Array.isArray(issue?.attachments) ? issue.attachments : []
  const classification = issue?.ai_analysis?.classification || {}
  const duplicateDetection = issue?.ai_analysis?.duplicate_detection || {}
  const category = issue?.category || classification.category || ''
  const aiCategoryConfidence = normalizeScore(
    issue?.ai_category_confidence ?? classification.confidence
  )
  const aiDuplicateScore = normalizeScore(
    issue?.ai_duplicate_score ?? duplicateDetection.duplicate_score
  )

  return {
    ...issue,
    status: issue?.status || 'reported',
    statusLabel: getIssueStatusLabel(issue?.status),
    verificationStatus: issue?.verification_status || 'pending',
    latitude: issue?.lat ?? null,
    longitude: issue?.lng ?? null,
    images: attachments.map((attachment) => attachment.file_url).filter(Boolean),
    category,
    categoryLabel: getIssueCategoryLabel(category),
    aiCategoryConfidence,
    aiSeverity: issue?.ai_severity || classification.severity || '',
    aiSummary: issue?.ai_summary || classification.summary || '',
    aiTags: issue?.ai_tags || classification.tags || [],
    aiDuplicateOf: issue?.ai_duplicate_of || duplicateDetection.duplicate_of || null,
    aiDuplicateScore,
    aiDuplicateCandidates:
      issue?.ai_duplicate_candidates || duplicateDetection.candidates || [],
    aiAnalyzedAt: issue?.ai_analyzed_at || issue?.ai_analysis?.analyzed_at || null,
    aiPending: !issue?.ai_analyzed_at && !issue?.ai_analysis?.analyzed_at,
  }
}

export async function listIssues({ organizationId } = {}) {
  const params = new URLSearchParams()
  if (organizationId) params.set('organization_id', organizationId)

  const suffix = params.toString() ? `?${params.toString()}` : ''
  const data = await api.get(`/issues${suffix}`)
  return (data?.issues ?? []).map(normalizeIssue)
}

export async function getIssueById(issueId, options) {
  const data = await api.get(`/issues/${issueId}`, options)
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

