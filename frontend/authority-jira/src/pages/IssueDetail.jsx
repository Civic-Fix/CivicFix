import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Brain,
  CalendarDays,
  CheckCircle2,
  Copy,
  Image,
  MapPin,
  RefreshCcw,
  Sparkles,
  UserRound,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import StatusBadge from '../components/ui/StatusBadge'
import { getIssueById, issueStatusOptions, updateIssue } from '../services/issuesService'
import { listTeamMembers } from '../services/teamService'
import { addUpdate, listUpdates } from '../services/updatesService'
import { formatDate } from '../utils/formatDate'

function normalizeImages(issue) {
  const images = issue?.images
  if (!images) return []
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    const trimmed = images.trim()
    if (!trimmed) return []
    const parts = trimmed
      .split(/[\n,]+/g)
      .map((p) => p.trim())
      .filter(Boolean)
    return parts.filter((p) => p.startsWith('http'))
  }
  return []
}

function formatPercent(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? `${Math.round(numericValue * 100)}%` : ''
}

function formatIssueId(id) {
  return id ? String(id).slice(0, 8) : '--'
}

const severityStyles = {
  low: 'bg-blue-50 text-blue-700 ring-blue-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  critical: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function IssueDetail() {
  const { issueId } = useParams()
  const [issue, setIssue] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [newUpdate, setNewUpdate] = useState('')
  const [postingUpdate, setPostingUpdate] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [assignedTo, setAssignedTo] = useState('')
  const [savingAssignee, setSavingAssignee] = useState(false)

  const images = useMemo(() => normalizeImages(issue), [issue])
  const aiConfidence = formatPercent(issue?.aiCategoryConfidence)
  const duplicateScore = formatPercent(issue?.aiDuplicateScore)

  const refresh = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [issueData, updatesData] = await Promise.all([getIssueById(issueId), listUpdates(issueId)])
      setIssue(issueData)
      setUpdates(updatesData)
      setNewStatus(issueData?.status || 'reported')
    } catch (err) {
      setError(err?.message || 'Failed to load issue')
    } finally {
      setLoading(false)
    }
  }, [issueId])

  useEffect(() => {
    refresh()
    listTeamMembers().then(setTeamMembers).catch(() => {})
  }, [refresh])

  useEffect(() => {
    if (issue) setAssignedTo(issue.assigned_to || '')
  }, [issue?.assigned_to])

  async function onSaveStatus() {
    if (!issue) return
    setSavingStatus(true)
    setError('')
    try {
      const updated = await updateIssue(issue.id, {
        status: newStatus,
        ...(newStatus === 'verified' ? { verification_status: 'authority_verified' } : {}),
      })
      setIssue(updated)
    } catch (err) {
      setError(err?.message || 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  async function onAssign(memberId) {
    if (!issue) return
    setAssignedTo(memberId)
    setSavingAssignee(true)
    setError('')
    try {
      const updated = await updateIssue(issue.id, { assigned_to: memberId || null })
      setIssue(updated)
    } catch (err) {
      setError(err?.message || 'Failed to assign member')
    } finally {
      setSavingAssignee(false)
    }
  }

  async function onAddUpdate(e) {
    e.preventDefault()
    if (!issue) return
    const content = newUpdate.trim()
    if (!content) return
    setPostingUpdate(true)
    setError('')
    try {
      await addUpdate({ issueId: issue.id, content })
      setNewUpdate('')
      const refreshed = await listUpdates(issue.id)
      setUpdates(refreshed)
    } catch (err) {
      setError(err?.message || 'Failed to add update')
    } finally {
      setPostingUpdate(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-6 lg:p-8">
        <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white px-5 py-16 text-center">
          <Loader label="Loading issue" />
        </div>
      </div>
    )
  }

  if (error && !issue) {
    return (
      <div className="space-y-8 p-6 lg:p-8">
        <div className="grid gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-rose-100 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
            {error}
          </div>
          <Link className="text-sm font-black text-emerald-700 hover:text-emerald-800" to="/issues">
            Back to issues
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="grid gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Issue Detail</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                {issue?.title || `Issue #${issue?.id}`}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={issue?.status || 'Open'} />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {issue?.locality || '--'}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  <CalendarDays className="mr-1.5 inline h-4 w-4 text-slate-400" />
                  Created {issue?.created_at ? formatDate(issue.created_at) : '--'}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="secondary" as={Link} to="/issues">
                Back
              </Button>
              <Button variant="secondary" onClick={refresh}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-rose-100 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left Column */}
          <Card>
            <CardHeader>
              <CardTitle>Citizen Report</CardTitle>
              <CardDescription>Submitted details, location, and supporting evidence.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-6">
              <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                {issue?.description || '--'}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Locality</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{issue?.locality || '--'}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Coordinates</p>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    {issue?.latitude != null && issue?.longitude != null
                      ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`
                      : 'No coordinates'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Issue ID</p>
                  <p className="mt-2 text-sm font-black text-slate-900">#{formatIssueId(issue?.id)}</p>
                </div>
              </div>

              {images.length ? (
                <div className="grid gap-3">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <Image className="h-4 w-4" />
                    Photos
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {images.map((src, idx) => (
                      <a
                        key={`${src}-${idx}`}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:border-emerald-300 hover:shadow-md"
                      >
                        <img
                          src={src}
                          alt={`Proof ${idx + 1}`}
                          className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardBody>
          </Card>

          {/* Right Column */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Triage
                </CardTitle>
                <CardDescription>Auto-categorization and duplicate detection from the issue database.</CardDescription>
              </CardHeader>
              <CardBody className="grid gap-4">
                {issue?.aiPending ? (
                  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                      <p className="text-sm font-black text-blue-900">AI analysis is still running</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-blue-700">
                        New and older reports are analyzed asynchronously. Refresh in a moment to load the category and duplicate check.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Category</p>
                        <p className="mt-2 text-lg font-black text-blue-950">{issue?.categoryLabel || 'Uncategorized'}</p>
                        <p className="mt-1 text-xs font-bold text-blue-700">{aiConfidence || 'No confidence score'}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Severity</p>
                        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${severityStyles[issue?.aiSeverity] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                          {issue?.aiSeverity || 'Not set'}
                        </span>
                      </div>
                    </div>

                    {issue?.aiSummary ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Summary</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{issue.aiSummary}</p>
                      </div>
                    ) : null}

                    {issue?.aiDuplicateOf ? (
                      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Copy className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <div>
                          <p className="text-sm font-black text-amber-900">
                            Possible duplicate of #{formatIssueId(issue.aiDuplicateOf)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-amber-800">
                            {duplicateScore ? `${duplicateScore} match` : 'Potential match'} based on nearby similar reports.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <div>
                          <p className="text-sm font-black text-emerald-900">No duplicate flagged</p>
                          <p className="mt-1 text-xs font-semibold text-emerald-800">
                            AI did not find a high-confidence duplicate in current reports.
                          </p>
                        </div>
                      </div>
                    )}

                    {issue?.aiTags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {issue.aiTags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
                <CardDescription>Update status and assignment.</CardDescription>
              </CardHeader>
              <CardBody className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Status</span>
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {issueStatusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button disabled={savingStatus} onClick={onSaveStatus}>
                  {savingStatus ? 'Saving...' : 'Save status'}
                </Button>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-700">
                    Assigned To
                    {savingAssignee && (
                      <span className="text-[10px] font-bold normal-case tracking-normal text-emerald-600">
                        Saving...
                      </span>
                    )}
                  </span>
                  <select
                    value={assignedTo}
                    onChange={(e) => onAssign(e.target.value)}
                    disabled={savingAssignee}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25 disabled:opacity-60"
                  >
                    <option value="">-- Unassigned --</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  {issue?.assigned_to_user && (
                    <p className="text-xs font-semibold text-slate-500">
                      Currently: {issue.assigned_to_user.name} &middot; {issue.assigned_to_user.role}
                    </p>
                  )}
                </label>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <UserRound className="h-4 w-4" />
                    Assignee
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {issue?.assigned_to_user?.name || 'Unassigned'}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Updates</CardTitle>
                <CardDescription>Progress logs and officer comments.</CardDescription>
              </CardHeader>
              <CardBody className="grid gap-4">
                <form onSubmit={onAddUpdate} className="grid gap-3">
                  <textarea
                    className="min-h-28 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Add a progress update..."
                  />
                  <Button disabled={postingUpdate} type="submit">
                    {postingUpdate ? 'Posting...' : 'Add Update'}
                  </Button>
                </form>

                <div className="grid gap-3">
                  {updates.length === 0 ? (
                    <p className="text-sm font-semibold text-slate-500">No updates yet.</p>
                  ) : (
                    updates.map((u) => (
                      <article
                        key={u.id}
                        className="rounded-lg border border-slate-200 bg-linear-to-r from-white to-slate-50 p-4 transition hover:border-emerald-200 hover:shadow-sm"
                      >
                        <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                          {u.content}
                        </p>
                        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                          {u.created_at ? formatDate(u.created_at) : '--'}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </CardBody>
              <CardFooter>
                <p className="text-xs font-semibold text-slate-500">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                  Tip: Keep updates factual and include next action + ETA.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetail
