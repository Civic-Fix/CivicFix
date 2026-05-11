import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Columns3,
  Filter,
  List,
  MapPin,
  RefreshCcw,
  Search,
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import Loader from '../components/ui/Loader'
import { issueStatusOptions, listIssues, updateIssue } from '../services/issuesService'
import { formatDate } from '../utils/formatDate'

const TEAM_MEMBERS = [
  { id: 1, name: 'Rajesh Kumar', initials: 'RK' },
  { id: 2, name: 'Priya Sharma', initials: 'PS' },
  { id: 3, name: 'Amit Patel', initials: 'AP' },
  { id: 4, name: 'Neha Gupta', initials: 'NG' },
]

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const priorityStyles = {
  Low: 'bg-blue-50 text-blue-700 ring-blue-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Critical: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const columnStyles = {
  reported: {
    shell: 'bg-blue-50/55',
    header: 'bg-blue-600 text-white',
    rail: 'bg-blue-500',
    drop: 'bg-blue-100/80',
  },
  verified: {
    shell: 'bg-emerald-50/70',
    header: 'bg-emerald-600 text-white',
    rail: 'bg-emerald-500',
    drop: 'bg-emerald-100/80',
  },
  in_progress: {
    shell: 'bg-orange-50/70',
    header: 'bg-orange-500 text-white',
    rail: 'bg-orange-500',
    drop: 'bg-orange-100/80',
  },
  review: {
    shell: 'bg-violet-50/70',
    header: 'bg-violet-600 text-white',
    rail: 'bg-violet-500',
    drop: 'bg-violet-100/80',
  },
  completed: {
    shell: 'bg-teal-50/70',
    header: 'bg-teal-600 text-white',
    rail: 'bg-teal-500',
    drop: 'bg-teal-100/80',
  },
  closed: {
    shell: 'bg-slate-100/80',
    header: 'bg-slate-600 text-white',
    rail: 'bg-slate-500',
    drop: 'bg-slate-200/80',
  },
  blocked: {
    shell: 'bg-rose-50/75',
    header: 'bg-rose-600 text-white',
    rail: 'bg-rose-500',
    drop: 'bg-rose-100/80',
  },
}

function moveItem(list, fromIndex, toIndex) {
  const next = Array.from(list)
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed)
  return next
}

function stableIndex(id, length) {
  const raw = String(id ?? '')
  const total = raw.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return total % length
}

function decorateIssue(issue) {
  return {
    ...issue,
    priority: issue.priority || PRIORITIES[stableIndex(issue.id, PRIORITIES.length)],
    assignee: issue.assignee || TEAM_MEMBERS[stableIndex(`${issue.id}:assignee`, TEAM_MEMBERS.length)],
  }
}

function IssueCard({ issue, index, onOpen }) {
  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            'group h-[8.75rem] rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition',
            snapshot.isDragging ? 'rotate-1 border-blue-300 shadow-xl shadow-blue-950/15' : 'hover:border-blue-200 hover:shadow-md',
          ].join(' ')}
        >
          <div className="grid h-full grid-rows-[2rem_1.25rem_1.25rem_1.75rem] gap-1.5">
            <div className="flex min-h-8 items-start justify-between gap-2">
              <p className="line-clamp-2 text-[12px] font-black leading-4 text-slate-950">
                {issue.title || `Issue #${issue.id}`}
              </p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpen(issue.id)
                }}
                className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                aria-label={`Open issue ${issue.id}`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <StatusBadge status={issue.status || 'reported'} className="px-2 py-0.5 leading-3" />
            </div>

            <div className="flex min-w-0 items-center gap-1.5 border-b border-slate-100 pb-1">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
              <span className="line-clamp-1 text-[10.5px] font-bold leading-4 text-slate-600">
                {issue.locality || 'No location'}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-500 text-[8px] font-black text-white">
                {issue.assignee?.initials || 'NA'}
              </span>
              <span className="min-w-0 truncate text-[10px] font-semibold leading-none text-slate-600">
                {issue.assignee?.name || 'Unassigned'}
              </span>
            </div>
          </div>
        </article>
      )}
    </Draggable>
  )
}

const ADMIN_ONLY_STATUSES = ['completed', 'blocked', 'closed']

function Issues() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const isAdmin = user?.profile?.role === 'admin'
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [viewMode, setViewMode] = useState('board')
  const [updatingIssueId, setUpdatingIssueId] = useState(null)

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const data = await listIssues()
      setRows(data.map(decorateIssue))
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
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        row.title?.toLowerCase().includes(query) ||
        row.description?.toLowerCase().includes(query) ||
        row.locality?.toLowerCase().includes(query) ||
        String(row.id).includes(query)
      const matchesStatus = filterStatus === 'All' || row.status === filterStatus
      const matchesPriority = filterPriority === 'All' || row.priority === filterPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [rows, searchTerm, filterStatus, filterPriority])

  const boardColumns = useMemo(() => {
    return issueStatusOptions.map((status) => ({
      ...status,
      issues: filteredRows.filter((row) => row.status === status.value),
    }))
  }, [filteredRows])

  async function handleDragEnd(result) {
    const { destination, draggableId, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const issueId = draggableId
    const previousRows = rows
    const targetStatus = destination.droppableId

    if (ADMIN_ONLY_STATUSES.includes(targetStatus) && !isAdmin) {
      setError(`Only admins can move issues to '${targetStatus}' status`)
      return
    }
    const visibleIds = new Set(filteredRows.map((row) => row.id))
    const nextColumns = boardColumns.map((column) => ({
      ...column,
      issues: [...column.issues],
    }))
    const sourceColumn = nextColumns.find((column) => column.value === source.droppableId)
    const destinationColumn = nextColumns.find((column) => column.value === destination.droppableId)
    if (!sourceColumn || !destinationColumn) return

    let movedIssue
    if (source.droppableId === destination.droppableId) {
      sourceColumn.issues = moveItem(sourceColumn.issues, source.index, destination.index)
      movedIssue = sourceColumn.issues[destination.index]
    } else {
      ;[movedIssue] = sourceColumn.issues.splice(source.index, 1)
      if (!movedIssue) return
      movedIssue = {
        ...movedIssue,
        status: targetStatus,
        statusLabel: targetStatus,
        ...(targetStatus === 'verified' ? { verification_status: 'authority_verified', verificationStatus: 'authority_verified' } : {}),
      }
      destinationColumn.issues.splice(destination.index, 0, movedIssue)
    }

    const reorderedVisibleRows = nextColumns.flatMap((column) => column.issues)
    const hiddenRows = rows.filter((row) => !visibleIds.has(row.id))

    setUpdatingIssueId(issueId)
    setRows([...hiddenRows, ...reorderedVisibleRows])

    if (targetStatus === source.droppableId) {
      setUpdatingIssueId(null)
      return
    }

    try {
      const updated = await updateIssue(issueId, {
        status: targetStatus,
        ...(targetStatus === 'verified' ? { verification_status: 'authority_verified' } : {}),
      })
      setRows((current) => current.map((row) => (String(row.id) === String(issueId) ? decorateIssue({ ...row, ...updated }) : row)))
    } catch (err) {
      setRows(previousRows)
      setError(err?.message || 'Failed to update issue status')
    } finally {
      setUpdatingIssueId(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 lg:p-6">
      <div className="mx-auto max-w-[96rem] space-y-4">
        <section className="border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <span>Projects</span>
                <span>/</span>
                <span>Civic operations</span>
                <span>/</span>
                <span>Issues</span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Issues</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Review citizen reports as a table or move cards across a Jira-style workflow board.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-bold transition ${
                    viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-bold transition ${
                    viewMode === 'board' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Columns3 className="h-4 w-4" />
                  Board
                </button>
              </div>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="flex items-center gap-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        ) : null}

        <section className="border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, description, location, or issue ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <label className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none rounded-md border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="All">All statuses</option>
                  {issueStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>
              <label className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="appearance-none rounded-md border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="All">All priorities</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>
              <span className="rounded-md bg-slate-900 px-3 py-2 text-sm font-black text-white">
                {filteredRows.length} result{filteredRows.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Loader label="Loading issues" />
          </div>
        ) : viewMode === 'list' ? (
          <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-3">Issue</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-12 text-center text-sm font-bold text-slate-500" colSpan={6}>
                        No issues found for your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id} className="group transition hover:bg-blue-50/40">
                        <td className="min-w-[24rem] px-4 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/issues/${row.id}`)}
                            className="block text-left"
                          >
                            <span className="block font-black text-slate-950 group-hover:text-blue-700">
                              {row.title || `Issue #${row.id}`}
                            </span>
                            <span className="mt-1 block line-clamp-1 text-xs font-semibold text-slate-500">
                              #{row.id} - {row.description || 'No description provided.'}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status || 'reported'} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${priorityStyles[row.priority]}`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="min-w-[12rem] px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                              {row.assignee?.initials || 'NA'}
                            </span>
                            <span className="font-semibold text-slate-700">{row.assignee?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="min-w-[12rem] px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-2 font-semibold">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {row.locality || '-'}
                          </span>
                        </td>
                        <td className="min-w-[12rem] px-4 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-2 font-semibold">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {row.created_at ? formatDate(row.created_at) : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex min-h-[32rem] gap-4">
                {boardColumns.map((column) => (
                  <div
                    key={column.value}
                    className={`flex max-h-[calc(100vh-15rem)] min-h-[30rem] w-64 shrink-0 flex-col rounded-xl border border-slate-200 shadow-sm ${
                      columnStyles[column.value]?.shell || 'bg-slate-50'
                    }`}
                  >
                    <div className="px-2.5 pb-2 pt-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`inline-flex min-w-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 ${columnStyles[column.value]?.header || 'bg-slate-700 text-white'} ${ADMIN_ONLY_STATUSES.includes(column.value) && !isAdmin ? 'opacity-60' : ''}`}>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/85" />
                          <h2 style={{ fontSize: '22px' }} className="truncate font-black uppercase tracking-wide">{column.label}</h2>
                          {ADMIN_ONLY_STATUSES.includes(column.value) && !isAdmin && (
                            <span style={{ fontSize: '9px' }} className="ml-1 rounded bg-white/20 px-1 py-0.5 font-bold">ADMIN</span>
                          )}
                        </div>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
                          {column.issues.length}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId={column.value}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={[
                            'flex-1 space-y-2.5 overflow-y-auto rounded-b-xl p-2.5 transition',
                            snapshot.isDraggingOver ? columnStyles[column.value]?.drop || 'bg-blue-50' : '',
                          ].join(' ')}
                        >
                          {column.issues.map((issue, index) => (
                            <IssueCard key={issue.id} issue={issue} index={index} onOpen={(id) => navigate(`/issues/${id}`)} />
                          ))}
                          {provided.placeholder}
                          {column.issues.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white/75 px-3 py-8 text-center text-xs font-bold text-slate-400">
                              Drop issues here
                            </div>
                          ) : null}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </section>
          </DragDropContext>
        )}

        {updatingIssueId ? (
          <div className="fixed bottom-5 right-5 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">
            Updating issue #{updatingIssueId}...
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Issues
