import React, { useState } from 'react'
import { Users, UserPlus, Mail, Shield, Trash2, Edit2 } from 'lucide-react'
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'

function Team() {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh@city.gov',
      role: 'Team Lead',
      department: 'Roads & Infrastructure',
      status: 'active',
      avatar: '🧑‍💼',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya@city.gov',
      role: 'Field Officer',
      department: 'Sanitation',
      status: 'active',
      avatar: '👩‍💼',
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit@city.gov',
      role: 'Inspector',
      department: 'Public Works',
      status: 'active',
      avatar: '👨‍💼',
    },
    {
      id: 4,
      name: 'Neha Gupta',
      email: 'neha@city.gov',
      role: 'Coordinator',
      department: 'Community Relations',
      status: 'inactive',
      avatar: '👩‍💻',
    },
  ])

  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Field Officer',
    department: '',
  })

  const handleAddMember = (e) => {
    e.preventDefault()
    if (newMember.name && newMember.email) {
      setTeamMembers([
        ...teamMembers,
        {
          id: teamMembers.length + 1,
          ...newMember,
          status: 'active',
          avatar: '👤',
        },
      ])
      setNewMember({ name: '', email: '', role: 'Field Officer', department: '' })
      setShowAddMember(false)
    }
  }

  const handleDeleteMember = (id) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id))
  }

  const roleColors = {
    'Team Lead': 'bg-purple-100 text-purple-800',
    'Field Officer': 'bg-blue-100 text-blue-800',
    'Inspector': 'bg-amber-100 text-amber-800',
    'Coordinator': 'bg-emerald-100 text-emerald-800',
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Team Management</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">Team Members</h1>
        <p className="text-sm font-semibold text-slate-700">Manage your team and assign tasks to members</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Total Members</p>
              <p className="text-3xl font-black text-slate-950">{teamMembers.length}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Active</p>
              <p className="text-3xl font-black text-emerald-600">
                {teamMembers.filter((m) => m.status === 'active').length}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-2">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Departments</p>
              <p className="text-3xl font-black text-slate-950">
                {new Set(teamMembers.map((m) => m.department)).size}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Utilization</p>
              <p className="text-3xl font-black text-slate-950">85%</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Section */}
      {!showAddMember ? (
        <Button onClick={() => setShowAddMember(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add New Team Member</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-slate-600">Full Name</span>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="Enter full name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-slate-600">Email</span>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="Enter email"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-slate-600">Role</span>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option>Field Officer</option>
                    <option>Inspector</option>
                    <option>Coordinator</option>
                    <option>Team Lead</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-slate-600">Department</span>
                  <input
                    type="text"
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="e.g., Roads & Infrastructure"
                  />
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage your team members</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{member.avatar}</span>
                        <span className="font-semibold text-slate-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleColors[member.role] || roleColors['Field Officer']}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{member.department}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-50">
                          <Edit2 className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default Team
