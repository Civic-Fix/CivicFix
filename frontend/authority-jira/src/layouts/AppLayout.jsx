import React from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LogOut, MapPinned, Table2, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function navLinkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition',
    isActive
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20'
      : 'text-slate-700 hover:bg-slate-950/5 hover:text-slate-950',
  ].join(' ')
}

function AppLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-bold text-slate-600">Loading session…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[16rem_1fr] lg:px-6">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 text-xs font-black text-white">
              CF
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">CivicFix</p>
              <p className="text-base font-black tracking-tight text-slate-900">Authority</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
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

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Account</p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="break-all text-xs font-semibold text-slate-900">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
