import React from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LogOut, MapPinned, ShieldCheck, Table2, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/issues', icon: Table2, label: 'Issues' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/map', icon: MapPinned, label: 'Map' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

const ROLE_SIDEBAR = {
  admin: 'bg-emerald-500/20 text-emerald-300',
  officer: 'bg-blue-500/20 text-blue-300',
  contractor: 'bg-amber-500/20 text-amber-300',
}

const ROLE_HEADER = {
  admin: 'bg-emerald-100 text-emerald-700',
  officer: 'bg-blue-100 text-blue-700',
  contractor: 'bg-amber-100 text-amber-700',
}

function navLinkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition-all',
    isActive
      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
      : 'text-slate-400 hover:bg-white/8 hover:text-white',
  ].join(' ')
}

function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function AppLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-500">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const profile = user.profile || {}
  const role = profile.role || 'officer'
  const displayName = profile.name || user.email || 'Unknown'
  const orgName = profile.organization?.name || 'Authority Dashboard'
  const roleColor = ROLE_SIDEBAR[role] || ROLE_SIDEBAR.officer
  const roleHeaderColor = ROLE_HEADER[role] || ROLE_HEADER.officer

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[15rem_1fr]">

      {/* Sidebar */}
      <aside className="border-r border-slate-800 bg-slate-950 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="border-b border-white/8 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">CivicFix</p>
                <p className="truncate text-sm font-black text-white">Authority</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-white/8 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-black text-slate-200">
                {initials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{displayName}</p>
                <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${roleColor}`}>
                  {role}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-5 lg:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">{orgName}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${roleHeaderColor}`}>
                  {role}
                </span>
                <span className="max-w-32 truncate text-xs font-semibold text-slate-500">{displayName}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
