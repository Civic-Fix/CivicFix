import { api } from './api'

export async function listTeamMembers() {
  const data = await api.get('/team/members')
  return data?.members ?? []
}

export async function addTeamMember({ name, email, password, role, dept }) {
  const data = await api.post('/team/members', { name, email, password, role, dept })
  return data?.member
}

export async function removeTeamMember(memberId) {
  return api.delete(`/team/members/${memberId}`)
}

export async function requestMemberAccess(memberId) {
  return api.post(`/team/members/${memberId}/request-access`, {}, { auth: false })
}

export async function approveMember(memberId) {
  return api.patch(`/team/members/${memberId}/verify`, {})
}
