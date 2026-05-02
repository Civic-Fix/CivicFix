import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Search, ChevronDown } from 'lucide-react'
import Table from '../components/ui/Table'
import StatusBadge from '../components/ui/StatusBadge'
import Loader from '../components/ui/Loader'
import Button from '../components/ui/Button'
import { listIssues } from '../services/issuesService'
import { formatDate } from '../utils/formatDate'

// Mock team members for assignment
const TEAM_MEMBERS = [
  { id: 1, name: 'Rajesh Kumar', avatar: '🧑‍💼' },
  { id: 2, name: 'Priya Sharma', avatar: '👩‍💼' },
  { id: 3, name: 'Amit Patel', avatar: '👨‍💼' },
  { id: 4, name: 'Neha Gupta', avatar: '👩‍💻' },
]

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

function Issues() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [selectedIssues, setSelectedIssues] = useState(new Set())

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const data = await listIssues()
      setRows(data.map((issue) => ({
        ...issue,
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        assignee: TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)],
      })))
    } catch (err) {
      setError(err?.message || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'All' || row.status === filterStatus
      const matchesPriority = filterPriority === 'All' || row.priority === filterPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [rows, searchTerm, filterStatus, filterPriority])

  const priorityColors = {
    Low: 'bg-blue-100 text-blue-800',
    Medium: 'bg-amber-100 text-amber-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-rose-100 text-rose-800',
  }

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        className: 'min-w-[20rem]',
        cell: (row) => (
          <button
            type="button"
            onClick={() => navigate(`/issues/${row.id}`)}
            className="text-left font-bold text-slate-950 hover:text-emerald-700"
          >
            {row.title || `Issue #${row.id}`}
          </button>
        ),
      },
      {
        key: 'priority',
        header: 'Priority',
        className: 'w-[10rem]',
        cell: (row) => (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityColors[row.priority] || priorityColors.Medium}`}>
            {row.priority}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        className: 'w-[10rem]',
        cell: (row) => <StatusBadge status={row.status || 'Open'} />,
      },
      {
        key: 'assignee',
        header: 'Assigned To',
        className: 'w-[12rem]',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-lg">{row.assignee?.avatar}</span>
            <span className="text-sm font-semibold text-slate-700">{row.assignee?.name || 'Unassigned'}</span>
          </div>
        ),
      },
      {
        key: 'locality',
        header: 'Location',
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
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Issues</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">Civic Reports</h1>
        <p className="text-sm font-semibold text-slate-700">Review, assign, and track all incoming civic issues</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900">
          {error}
        </div>
      ) : null}

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>
          </div>
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
            >
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          </div>

          <div className="relative">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
            >
              <option>All Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            <Filter className="h-4 w-4" />
            {filteredRows.length} result{filteredRows.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <Loader label="Loading issues" />
        </div>
      ) : (
        <Table
          columns={columns}
          rows={filteredRows}
          emptyState="No issues found for your filters."
          rowKey={(row) => row.id}
        />
      )}
    </div>
  )
}

export default Issues
