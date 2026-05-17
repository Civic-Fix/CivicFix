import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'

export async function listAllUpdates() {
  const authToken = await AsyncStorage.getItem('authToken')
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}

  const response = await fetch(`${API_BASE_URL}/issues/updates`, {
    headers,
  })
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Unable to fetch updates')
  }

  return Array.isArray(result.updates) ? result.updates : []
}

export async function listIssueUpdates(issueId) {
  if (!issueId) return [];

  const authToken = await AsyncStorage.getItem('authToken')
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}

  const response = await fetch(`${API_BASE_URL}/issues/${encodeURIComponent(issueId)}/updates`, {
    headers,
  })
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Unable to fetch issue updates')
  }

  return Array.isArray(result.updates) ? result.updates : []
}
