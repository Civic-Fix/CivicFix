import React, { useEffect, useState } from 'react'
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import { getIssueStats } from '../services/issuesService'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    async function run() {
      if (isMounted) {
        setError('')
        setLoading(true)
      }
      try {
        const s = await getIssueStats()
        if (isMounted) setStats(s)
      } catch (err) {
        if (isMounted) setError(err?.message || 'Failed to load stats')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header with Gradient */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">📊 Dashboard</p>
            <h1 className="bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-950 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Civic Overview
            </h1>
            <p className="text-base font-semibold text-slate-600">Monitor issues, track resolution, and manage your team</p>
          </div>
        </div>
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-16 text-center">
          <Loader label="Loading dashboard" />
        </div>
      ) : (
        <>
          {/* Stats Cards - Modern Jira Style */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Issues */}
            <div className="group relative rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-500/0 to-slate-500/0 opacity-0 transition group-hover:opacity-5"></div>
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Total Issues</p>
                    <p className="text-4xl font-black text-slate-950">{stats?.total ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-2.5">
                    <TrendingUp className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-500">All reports in the system</p>
              </div>
            </div>

            {/* Open Issues */}
            <div className="group relative rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition hover:border-amber-300 hover:shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 opacity-0 transition group-hover:opacity-5"></div>
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Open Issues</p>
                    <p className="text-4xl font-black text-amber-700">{stats?.open ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 p-2.5">
                    <Clock className="h-5 w-5 text-amber-700" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-amber-600">Needs action</p>
              </div>
            </div>

            {/* Resolved Issues */}
            <div className="group relative rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 transition group-hover:opacity-5"></div>
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Resolved</p>
                    <p className="text-4xl font-black text-emerald-700">{stats?.resolved ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-emerald-600">Fixed or closed</p>
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="group relative rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-500/0 via-slate-500/0 to-slate-500/0 opacity-0 transition group-hover:opacity-5"></div>
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Resolution Rate</p>
                    <p className="text-4xl font-black text-slate-950">
                      {stats?.total ? Math.round((stats?.resolved / stats?.total) * 100) : 0}<span className="text-2xl">%</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-2.5">
                    <TrendingUp className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-500">Performance metric</p>
              </div>
            </div>
          </div>

          {/* Status Breakdown - Modern Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📊</span> Issues by Status
              </CardTitle>
              <CardDescription>Current distribution of all civic reports</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 transition hover:border-slate-200 hover:shadow-sm">
                    <span className="font-bold text-slate-800">{status}</span>
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-sm font-black text-white">{count}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⚡</span> Quick Actions
              </CardTitle>
              <CardDescription>Common workflows and shortcuts</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-3">
                <a href="/issues" className="group relative inline-flex overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-xl hover:shadow-emerald-600/40">
                  <span className="relative flex items-center gap-2">
                    <span>📋</span> View All Issues
                  </span>
                </a>
                <a href="/team" className="group relative inline-flex overflow-hidden rounded-lg border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <span className="relative flex items-center gap-2">
                    <span>👥</span> View Team
                  </span>
                </a>
                <a href="/map" className="group relative inline-flex overflow-hidden rounded-lg border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <span className="relative flex items-center gap-2">
                    <span>🗺️</span> View Map
                  </span>
                </a>
                <a href="/reports" className="group relative inline-flex overflow-hidden rounded-lg border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <span className="relative flex items-center gap-2">
                    <span>📈</span> View Reports
                  </span>
                </a>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

export default Dashboard
