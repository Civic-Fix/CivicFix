import React from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LogOut, MapPinned, Table2 } from 'lucide-react'
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
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[18rem_1fr] lg:px-6">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 text-sm font-black text-white shadow-lg shadow-emerald-700/25">
                CF
              </div>
              <div className="leading-tight">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">CivicFix</p>
                <p className="text-lg font-black tracking-tight">Authority</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/issues" className={navLinkClass}>
              <Table2 className="h-4 w-4" />
              Issues
            </NavLink>
            <NavLink to="/map" className={navLinkClass}>
              <MapPinned className="h-4 w-4" />
              Map
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 className="h-4 w-4" />
              Reports
            </NavLink>
          </nav>

          <div className="mt-8 rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Signed in</p>
            <p className="mt-1 break-all text-sm font-bold text-slate-700">{user.email}</p>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
