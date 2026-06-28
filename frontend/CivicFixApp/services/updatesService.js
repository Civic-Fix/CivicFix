import { API_BASE_URL } from '../config'
import { authenticatedFetch } from '../utils/authSession'

export async function listAllUpdates() {
  const response = await authenticatedFetch(`${API_BASE_URL}/issues/updates`)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Unable to fetch updates')
  }

  return Array.isArray(result.updates) ? result.updates : []
}

export async function listIssueUpdates(issueId) {
  if (!issueId) return [];

  const response = await authenticatedFetch(`${API_BASE_URL}/issues/${encodeURIComponent(issueId)}/updates`)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Unable to fetch issue updates')
  }

  return Array.isArray(result.updates) ? result.updates : []
}
