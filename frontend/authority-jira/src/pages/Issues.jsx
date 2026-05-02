import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/ui/Table'
import StatusBadge from '../components/ui/StatusBadge'
import Loader from '../components/ui/Loader'
import Button from '../components/ui/Button'
import { listIssues } from '../services/issuesService'
import { formatDate } from '../utils/formatDate'

function Issues() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const data = await listIssues()
      setRows(data)
    } catch (err) {
      setError(err?.message || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        className: 'min-w-[18rem]',
        cell: (row) => (
          <button
            type="button"
            onClick={() => navigate(`/issues/${row.id}`)}
            className="text-left font-black text-slate-950 hover:text-emerald-700"
          >
            {row.title || `Issue #${row.id}`}
          </button>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        className: 'w-[10rem]',
        cell: (row) => <StatusBadge status={row.status || 'Open'} />,
      },
      {
        key: 'locality',
        header: 'Locality',
        className: 'min-w-[10rem] text-slate-600',
        cell: (row) => row.locality || '—',
      },
      {
        key: 'created_at',
        header: 'Created',
        className: 'w-[14rem] text-slate-600',
        cell: (row) => (row.created_at ? formatDate(row.created_at) : '—'),
      },
    ],
    [navigate],
  )

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Issues</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">All civic reports</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Review incoming reports and keep status/ownership up to date.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-10">
          <Loader label="Loading issues" />
        </div>
      ) : (
        <Table
          columns={columns}
          rows={rows}
          emptyState="No issues found for your organization."
          rowKey={(row) => row.id}
        />
      )}
    </div>
  )
}

export default Issues
