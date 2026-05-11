import React, { useContext, useEffect, useState } from 'react'
import { AlertCircle, Building2, CheckCircle, Mail, RefreshCcw, Shield, Trash2, UserPlus, Users, X } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { addTeamMember, approveMember, listTeamMembers, removeTeamMember } from '../services/teamService'

const ROLES = ['officer', 'contractor']

const roleStyles = {
  admin: 'bg-purple-100 text-purple-800',
  officer: 'bg-blue-100 text-blue-800',
  contractor: 'bg-amber-100 text-amber-800',
}

const initials = (name) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

const avatarColor = (id) => {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-rose-500', 'bg-teal-500']
  const sum = (id ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[sum % colors.length]
}

function Team() {
  const { user } = useContext(AuthContext)
  const isAdmin = user?.profile?.role === 'admin'

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formError, setFormError] = useState('')

  const [approvingId, setApprovingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'officer', dept: '' })

  async function load() {
    setError('')
    setLoading(true)
    try {
      setMembers(await listTeamMembers())
    } catch (err) {
      setError(err.message || 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const member = await addTeamMember(form)
      setMembers((prev) => [...prev, member])
      setForm({ name: '', email: '', password: '', role: 'officer', dept: '' })
      setShowForm(false)
    } catch (err) {
      setFormError(err.message || 'Failed to add member')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove(id) {
    setApprovingId(id)
    try {
      await approveMember(id)
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, is_verified: true, access_requested: false } : m))
    } catch (err) {
      setError(err.message || 'Failed to approve member')
    } finally {
      setApprovingId(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this team member? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      await removeTeamMember(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to remove member')
    } finally {
      setDeletingId(null)
    }
  }

  const totalByRole = (role) => members.filter((m) => m.role === role).length

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Team</p>
            <h1 className="bg-linear-to-r from-slate-950 via-slate-800 to-emerald-950 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Team Members
            </h1>
            <p className="text-base font-semibold text-slate-600">
              {user?.profile?.organization?.name || 'Your Organization'}
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="h-1 w-16 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Total</p>
              <p className="mt-1 text-4xl font-black text-slate-950">{members.length}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2.5"><Users className="h-5 w-5 text-slate-700" /></div>
          </div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 to-violet-50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-700">Admins</p>
              <p className="mt-1 text-4xl font-black text-purple-700">{totalByRole('admin')}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-2.5"><Shield className="h-5 w-5 text-purple-700" /></div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Officers</p>
              <p className="mt-1 text-4xl font-black text-blue-700">{totalByRole('officer')}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-2.5"><Users className="h-5 w-5 text-blue-700" /></div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Contractors</p>
              <p className="mt-1 text-4xl font-black text-amber-700">{totalByRole('contractor')}</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-2.5"><Building2 className="h-5 w-5 text-amber-700" /></div>
          </div>
        </div>
      </div>

      {/* Add Member button (admin only) */}
      {isAdmin && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-xl hover:shadow-emerald-600/40"
        >
          <UserPlus className="h-5 w-5" />
          Add Team Member
        </button>
      )}

      {/* Add Member Form */}
      {isAdmin && showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Add New Team Member</h2>
            <button onClick={() => { setShowForm(false); setFormError('') }} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Full Name *</span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="Full name"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Email *</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="email@org.com"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Password *</span>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="Min 6 characters"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Role *</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">Department</span>
                <input
                  type="text"
                  value={form.dept}
                  onChange={(e) => setForm({ ...form, dept: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  placeholder="e.g. Roads & Infrastructure"
                />
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-linear-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? 'Adding…' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError('') }}
                className="rounded-lg border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member List */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-950">All Members ({members.length})</h2>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-sm font-bold text-slate-500">
            Loading team…
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm font-bold text-slate-400">
            No team members yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="group relative rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black text-white ${avatarColor(member.id)}`}>
                    {initials(member.name)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-950">
                        {member.name || '—'}
                        {member.id === user?.id && (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">You</span>
                        )}
                      </h3>
                      {isAdmin && member.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(member.id)}
                          disabled={deletingId === member.id}
                          className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 p-1.5 opacity-0 transition group-hover:opacity-100 hover:bg-rose-100 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </button>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Mail className="h-3 w-3 shrink-0" />
                      {member.email || '—'}
                    </p>
                    {member.dept && (
                      <p className="text-xs font-semibold text-slate-500">{member.dept}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold capitalize ${roleStyles[member.role] || 'bg-slate-100 text-slate-700'}`}>
                        {member.role}
                      </span>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${member.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {member.is_verified ? '● Verified' : '● Pending'}
                      </span>
                      {member.access_requested && !member.is_verified && (
                        <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
                          ● Requested Access
                        </span>
                      )}
                    </div>
                    {isAdmin && !member.is_verified && member.id !== user?.id && (
                      <button
                        onClick={() => handleApprove(member.id)}
                        disabled={approvingId === member.id}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {approvingId === member.id ? 'Approving…' : 'Approve Access'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Team
