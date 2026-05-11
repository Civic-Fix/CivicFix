import React from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Bell, LayoutDashboard, LogOut, MapPinned, Search, Table2, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function navLinkClass({ isActive }) {
  return [
    'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold no-underline transition',
    isActive
      ? 'bg-blue-500 text-white shadow-sm shadow-blue-950/30'
      : 'text-slate-400 hover:bg-white/10 hover:text-white',
  ].join(' ')
}

function AppLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-6xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-bold text-slate-600">Loading session...</p>
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

  const ROLE_HEADER = {
    admin: 'bg-emerald-100 text-emerald-700',
    officer: 'bg-blue-100 text-blue-700',
    contractor: 'bg-amber-100 text-amber-700',
  }
  const roleHeaderColor = ROLE_HEADER[role] || ROLE_HEADER.officer

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="border-r border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/10 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="border-b border-white/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-500 text-xs font-black text-white shadow-sm shadow-blue-950/30">
                CF
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">CivicFix</p>
                <p className="text-sm font-black tracking-tight text-white">Authority Desk</p>
              </div>
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Workspace
            </p>
            <NavLink to="/dashboard" className={navLinkClass}>
              <span className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/issues" className={navLinkClass}>
              <span className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white">
                <Table2 className="h-4 w-4" />
              </span>
              <span>Issues</span>
            </NavLink>
            <NavLink to="/team" className={navLinkClass}>
              <span className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white">
                <Users className="h-4 w-4" />
              </span>
              <span>Team</span>
            </NavLink>
            <NavLink to="/map" className={navLinkClass}>
              <span className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white">
                <MapPinned className="h-4 w-4" />
              </span>
              <span>Map</span>
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              <span className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span>Reports</span>
            </NavLink>
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Signed in</p>
            <p className="mt-2 truncate text-sm font-bold text-slate-100">{displayName}</p>
            {displayName !== user.email ? (
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user.email}</p>
            ) : null}
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-950/5 backdrop-blur lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden min-w-0 max-w-xl flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-500 md:flex">
              <Search className="h-4 w-4" />
              <span>Search issues, wards, assignees...</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:flex">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${roleHeaderColor}`}>
                  {role}
                </span>
                <span className="max-w-32 truncate text-xs font-semibold text-slate-600">{orgName}</span>
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
