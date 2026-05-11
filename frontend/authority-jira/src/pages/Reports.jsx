import React, { useEffect, useMemo, useState } from 'react'
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import StatusBadge from '../components/ui/StatusBadge'
import { getIssueStats } from '../services/issuesService'

function Reports() {
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
        if (isMounted) setError(err?.message || 'Failed to load reports')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [])

  const breakdownRows = useMemo(() => {
    const entries = Object.entries(stats?.byStatus || {})
    entries.sort((a, b) => b[1] - a[1])
    return entries.map(([status, count]) => ({ status, count }))
  }, [stats])

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header with Gradient */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">📈 Reports</p>
            <h1 className="bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-950 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Analytics & Insights
            </h1>
            <p className="text-base font-semibold text-slate-600">Key metrics and performance analytics for civic issues</p>
          </div>
        </div>
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-5 py-16 text-center">
          <Loader label="Loading reports" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span> Total Issues
                </CardTitle>
                <CardDescription>All reports in the system.</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-5xl font-black tracking-tight text-slate-950">{stats?.total ?? 0}</p>
                  <p className="text-xs font-semibold text-slate-500">Complete database</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⏳</span> Open Issues
                </CardTitle>
                <CardDescription>Awaiting resolution.</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-5xl font-black tracking-tight text-amber-700">{stats?.open ?? 0}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                      style={{
                        width: `${stats?.total ? Math.round((stats.open / stats.total) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">✓</span> Resolved Issues
                </CardTitle>
                <CardDescription>Resolved or closed.</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-5xl font-black tracking-tight text-emerald-700">{stats?.resolved ?? 0}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                      style={{
                        width: `${stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Breakdown by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span> Breakdown by Status
              </CardTitle>
              <CardDescription>Distribution of all issues across different statuses</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {breakdownRows.map((row) => (
                  <div key={row.status} className="flex items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 transition hover:border-emerald-200 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={row.status} />
                      <span className="text-sm font-semibold text-slate-600">{row.status}</span>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-sm font-black text-white">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span> Performance Metrics
              </CardTitle>
              <CardDescription>Key indicators and efficiency rates</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Resolution Rate</p>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-4xl font-black text-slate-950">
                      {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}
                      <span className="text-2xl">%</span>
                    </p>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Resolved vs Total Issues</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Pending Rate</p>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-4xl font-black text-slate-950">
                      {stats?.total ? Math.round((stats.open / stats.total) * 100) : 0}
                      <span className="text-2xl">%</span>
                    </p>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Open vs Total Issues</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

export default Reports

