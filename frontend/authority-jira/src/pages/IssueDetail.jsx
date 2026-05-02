import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card, { CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import StatusBadge from '../components/ui/StatusBadge'
import { getIssueById, updateIssue } from '../services/issuesService'
import { addUpdate, listUpdates } from '../services/updatesService'
import { formatDate } from '../utils/formatDate'

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed', 'Rejected']

function normalizeImages(issue) {
  const images = issue?.images
  if (!images) return []
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    const trimmed = images.trim()
    if (!trimmed) return []

    // Support either a single public URL or multiple URLs separated by commas/newlines.
    const parts = trimmed
      .split(/[\n,]+/g)
      .map((p) => p.trim())
      .filter(Boolean)

    return parts.filter((p) => p.startsWith('http'))
  }
  return []
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

  const images = useMemo(() => normalizeImages(issue), [issue])

  const refresh = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [issueData, updatesData] = await Promise.all([getIssueById(issueId), listUpdates(issueId)])
      setIssue(issueData)
      setUpdates(updatesData)
      setNewStatus(issueData?.status || 'Open')
    } catch (err) {
      setError(err?.message || 'Failed to load issue')
    } finally {
      setLoading(false)
    }
  }, [issueId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function onSaveStatus() {
    if (!issue) return
    setSavingStatus(true)
    setError('')
    try {
      const updated = await updateIssue(issue.id, { status: newStatus })
      setIssue(updated)
    } catch (err) {
      setError(err?.message || 'Failed to update status')
    } finally {
      setSavingStatus(false)
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
      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-10">
        <Loader label="Loading issue" />
      </div>
    )
  }

  if (error && !issue) {
    return (
      <div className="grid gap-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
          {error}
        </div>
        <Link className="text-sm font-black text-emerald-700 hover:text-emerald-800" to="/issues">
          ← Back to issues
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Issue</p>
          <h1 className="mt-2 truncate text-3xl font-black tracking-tight text-slate-950">
            {issue?.title || `Issue #${issue?.id}`}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue?.status || 'Open'} />
            <span className="text-sm font-semibold text-slate-600">{issue?.locality || '—'}</span>
            <span className="text-sm font-semibold text-slate-400">•</span>
            <span className="text-sm font-semibold text-slate-600">
              Created {issue?.created_at ? formatDate(issue.created_at) : '—'}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" as={Link} to="/issues">
            Back
          </Button>
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

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Citizen-submitted details and supporting evidence.</CardDescription>
          </CardHeader>
          <CardBody className="grid gap-6">
            <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
              {issue?.description || '—'}
            </p>

            {images.length ? (
              <div className="grid gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Images</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {images.map((src, idx) => (
                    <a
                      key={`${src}-${idx}`}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={src}
                        alt={`Proof ${idx + 1}`}
                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>Update status and ownership.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Status</span>
                <select
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <Button disabled={savingStatus} onClick={onSaveStatus}>
                {savingStatus ? 'Saving…' : 'Save status'}
              </Button>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Assigned to</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{issue?.assigned_to || 'Unassigned'}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{issue?.locality || '—'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {issue?.latitude && issue?.longitude ? `${issue.latitude}, ${issue.longitude}` : '—'}
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
              <form onSubmit={onAddUpdate} className="grid gap-2">
                <textarea
                  className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Add a progress update…"
                />
                <Button disabled={postingUpdate} type="submit">
                  {postingUpdate ? 'Posting…' : 'Add update'}
                </Button>
              </form>

              <div className="grid gap-3">
                {updates.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-600">No updates yet.</p>
                ) : (
                  updates.map((u) => (
                    <article key={u.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">{u.content}</p>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {u.created_at ? formatDate(u.created_at) : '—'}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </CardBody>
            <CardFooter>
              <p className="text-xs font-semibold text-slate-500">
                Tip: keep updates factual and include next action + ETA.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default IssueDetail
