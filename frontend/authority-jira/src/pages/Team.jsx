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
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header with Gradient */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">👥 Team</p>
            <h1 className="bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-950 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Team Members
            </h1>
            <p className="text-base font-semibold text-slate-600">Manage your team and assign tasks to members</p>
          </div>
        </div>
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
      </div>

      {/* Stats - Modern Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-lg">
          <div className="relative space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Total Members</p>
                <p className="text-4xl font-black text-slate-950">{teamMembers.length}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-2.5">
                <Users className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500">Across all departments</p>
          </div>
        </div>

        <div className="group relative rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-lg">
          <div className="relative space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Active Members</p>
                <p className="text-4xl font-black text-emerald-700">
                  {teamMembers.filter((m) => m.status === 'active').length}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5">
                <Shield className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-600">Ready to assign</p>
          </div>
        </div>

        <div className="group relative rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-lg">
          <div className="relative space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Departments</p>
                <p className="text-4xl font-black text-slate-950">
                  {new Set(teamMembers.map((m) => m.department)).size}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-2.5">
                <Users className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500">Coverage</p>
          </div>
        </div>

        <div className="group relative rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm transition hover:border-blue-300 hover:shadow-lg">
          <div className="relative space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Utilization</p>
                <p className="text-4xl font-black text-blue-700">85<span className="text-2xl">%</span></p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 p-2.5">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </div>
            <p className="text-xs font-semibold text-blue-600">Capacity</p>
          </div>
        </div>
      </div>

      {/* Add Member Button */}
      {!showAddMember && (
        <button
          onClick={() => setShowAddMember(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-xl hover:shadow-emerald-600/40"
        >
          <UserPlus className="h-5 w-5" />
          Add Team Member
        </button>
      )}

      {/* Add Member Form */}
      {showAddMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">➕</span> Add New Team Member
            </CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddMember} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Full Name *</span>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="Enter full name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Email *</span>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="Enter email"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Role *</span>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option>Field Officer</option>
                    <option>Inspector</option>
                    <option>Coordinator</option>
                    <option>Team Lead</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Department *</span>
                  <input
                    type="text"
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="e.g., Roads & Infrastructure"
                  />
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-xl hover:shadow-emerald-600/40"
                >
                  ✓ Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="rounded-lg border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Team Members - Modern Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-950">👨‍💼 Team Members</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-5 transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{member.avatar}</div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-black text-slate-950">{member.name}</h3>
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">{member.department}</p>
                    <div className="flex gap-2 pt-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleColors[member.role] || roleColors['Field Officer']}`}>
                        {member.role}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {member.status === 'active' ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                  <button className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-100">
                    <Edit2 className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 p-2 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Team
