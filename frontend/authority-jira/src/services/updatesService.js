import { api } from './api'

export async function listUpdates(issueId) {
  const data = await api.get(`/issues/${issueId}/updates`)
  return data?.updates ?? []
}

export async function addUpdate({ issueId, content, attachments = [] }) {
  const data = await api.post(`/issues/${issueId}/updates`, { content, attachments })
  return data?.update
}

