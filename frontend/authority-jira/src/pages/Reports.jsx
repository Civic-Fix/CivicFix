import React, { useEffect, useMemo, useState } from 'react'
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import StatusBadge from '../components/ui/StatusBadge'
import Table from '../components/ui/Table'
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

  const breakdownCols = useMemo(
    () => [
      { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
      { key: 'count', header: 'Count', className: 'w-[8rem] text-slate-700', cell: (row) => row.count },
    ],
    [],
  )

  return (
    <div className="grid gap-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Reports</p>
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Analytics</h1>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-10">
          <Loader label="Loading reports" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total issues</CardTitle>
                <CardDescription>All reports.</CardDescription>
              </CardHeader>
              <CardBody>
                <p className="text-4xl font-black tracking-tight text-slate-950">{stats?.total ?? 0}</p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Open</CardTitle>
                <CardDescription>Not yet resolved.</CardDescription>
              </CardHeader>
              <CardBody>
                <p className="text-4xl font-black tracking-tight text-amber-700">{stats?.open ?? 0}</p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resolved</CardTitle>
                <CardDescription>Resolved / closed.</CardDescription>
              </CardHeader>
              <CardBody>
                <p className="text-4xl font-black tracking-tight text-emerald-700">{stats?.resolved ?? 0}</p>
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Breakdown by status</p>
            <Table columns={breakdownCols} rows={breakdownRows} emptyState="No data." rowKey={(r) => r.status} />
          </div>
        </>
      )}
    </div>
  )
}

export default Reports

