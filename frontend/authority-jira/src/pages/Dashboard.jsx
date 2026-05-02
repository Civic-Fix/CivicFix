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
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Dashboard</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">Overview</h1>
        <p className="text-sm font-semibold text-slate-700">Track civic issues and team performance at a glance</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">
          <AlertCircle className="mb-2 inline-block h-4 w-4" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <Loader label="Loading dashboard" />
        </div>
      ) : (
        <>
          {/* Stats Cards - Jira Style */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-600">Total Issues</p>
                  <p className="text-3xl font-black text-slate-950">{stats?.total ?? 0}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">All reports in the system</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-600">Open Issues</p>
                  <p className="text-3xl font-black text-amber-600">{stats?.open ?? 0}</p>
                </div>
                <div className="rounded-lg bg-amber-100 p-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Needs action or in progress</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-600">Resolved</p>
                  <p className="text-3xl font-black text-emerald-600">{stats?.resolved ?? 0}</p>
                </div>
                <div className="rounded-lg bg-emerald-100 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Fixed or closed</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-600">Resolution Rate</p>
                  <p className="text-3xl font-black text-slate-950">
                    {stats?.total ? Math.round((stats?.resolved / stats?.total) * 100) : 0}%
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Performance metric</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Status</CardTitle>
              <CardDescription>Current distribution of all civic reports</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="font-semibold text-slate-700">{status}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common workflows</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-3">
                <a href="/issues" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                  View All Issues
                </a>
                <a href="/map" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  View Map
                </a>
                <a href="/reports" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  View Reports
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
