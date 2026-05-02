import React, { useEffect, useState } from 'react'
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
    <div className="grid gap-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Dashboard</p>
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Overview</h1>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-10">
          <Loader label="Loading dashboard" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total issues</CardTitle>
              <CardDescription>All reports in the system.</CardDescription>
            </CardHeader>
            <CardBody>
              <p className="text-4xl font-black tracking-tight text-slate-950">{stats?.total ?? 0}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Open</CardTitle>
              <CardDescription>Needs action or in progress.</CardDescription>
            </CardHeader>
            <CardBody>
              <p className="text-4xl font-black tracking-tight text-amber-700">{stats?.open ?? 0}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resolved</CardTitle>
              <CardDescription>Verified or closed.</CardDescription>
            </CardHeader>
            <CardBody>
              <p className="text-4xl font-black tracking-tight text-emerald-700">{stats?.resolved ?? 0}</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Dashboard
