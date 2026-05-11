import React from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Bell, LayoutDashboard, LogOut, MapPinned, Search, Table2, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function navLinkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold no-underline transition',
    isActive
      ? 'bg-blue-500 text-white shadow-sm shadow-blue-950/20'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
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
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[14.5rem_1fr]">
      <aside className="border-r border-slate-800 bg-slate-950 text-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-blue-500 text-xs font-black text-white">
                CF
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">CivicFix</p>
                <p className="text-sm font-black tracking-tight text-white">Authority Desk</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/issues" className={navLinkClass}>
              <Table2 className="h-4 w-4" />
              <span>Issues</span>
            </NavLink>
            <NavLink to="/team" className={navLinkClass}>
              <Users className="h-4 w-4" />
              <span>Team</span>
            </NavLink>
            <NavLink to="/map" className={navLinkClass}>
              <MapPinned className="h-4 w-4" />
              <span>Map</span>
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </NavLink>
          </nav>

          <div className="border-t border-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Signed in</p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-200">{user.email}</p>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden min-w-0 max-w-xl flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
              <Search className="h-4 w-4" />
              <span>Search issues, wards, assignees...</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 sm:flex">
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
