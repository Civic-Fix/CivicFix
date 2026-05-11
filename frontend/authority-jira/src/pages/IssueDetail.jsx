import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card, { CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import StatusBadge from '../components/ui/StatusBadge'
import { getIssueById, issueStatusOptions, updateIssue } from '../services/issuesService'
import { addUpdate, listUpdates } from '../services/updatesService'
import { formatDate } from '../utils/formatDate'

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
      setNewStatus(issueData?.status || 'reported')
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
    console.log('[IssueDetail] onSaveStatus called', { currentStatus: issue.status, newStatus })
    setSavingStatus(true)
    setError('')
    try {
      console.log('[IssueDetail] calling updateIssue', { issueId: issue.id, newStatus })
      const updated = await updateIssue(issue.id, {
        status: newStatus,
        ...(newStatus === 'verified' ? { verification_status: 'authority_verified' } : {}),
      })
      console.log('[IssueDetail] updateIssue returned', { updatedStatus: updated?.status })
      setIssue(updated)
      console.log('[IssueDetail] issue state updated', { currentIssueStatus: updated?.status })
    } catch (err) {
      console.error('[IssueDetail] updateIssue error', err)
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
            â† Back to issues
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="grid gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">ðŸ“‹ Issue Detail</p>
              <h1 className="bg-linear-to-r from-slate-950 via-slate-800 to-emerald-950 bg-clip-text text-3xl font-black tracking-tight text-transparent">
                {issue?.title || `Issue #${issue?.id}`}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={issue?.status || 'Open'} />
                <span className="text-sm font-semibold text-slate-600">ðŸ“ {issue?.locality || 'â€”'}</span>
                <span className="text-sm font-semibold text-slate-400">â€¢</span>
                <span className="text-sm font-semibold text-slate-600">
                  Created {issue?.created_at ? formatDate(issue.created_at) : 'â€”'}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="secondary" as={Link} to="/issues">
                â† Back
              </Button>
              <Button variant="secondary" onClick={refresh}>
                ðŸ”„ Refresh
              </Button>
            </div>
          </div>
          <div className="h-1 w-16 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600"></div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-rose-100 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
            {error}
          </div>
        ) : null}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left Column - Description & Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">ðŸ“</span> Description
              </CardTitle>
              <CardDescription>Citizen-submitted details and supporting evidence.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-6">
              <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                {issue?.description || 'â€”'}
              </p>

              {images.length ? (
                <div className="grid gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">ðŸ“¸ Photos</p>
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

          {/* Right Column - Workflow & Updates */}
          <div className="grid gap-6">
            {/* Workflow Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">âš™ï¸</span> Workflow
                </CardTitle>
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
                  {savingStatus ? 'â³ Savingâ€¦' : 'âœ“ Save status'}
                </Button>

                <div className="rounded-lg border border-slate-200 bg-linear-to-r from-slate-50 to-white p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">ðŸ‘¤ Assigned To</p>
                  <p className="mt-2 text-sm font-bold text-slate-800">{issue?.assigned_to || 'â€”'}</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-linear-to-r from-slate-50 to-white p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">ðŸ“ Location</p>
                  <p className="mt-2 text-sm font-bold text-slate-800">{issue?.locality || 'â€”'}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {issue?.latitude !== null && issue?.longitude !== null ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}` : 'No coordinates'}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Updates Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">ðŸ’¬</span> Updates
                </CardTitle>
                <CardDescription>Progress logs and officer comments.</CardDescription>
              </CardHeader>
              <CardBody className="grid gap-4">
                <form onSubmit={onAddUpdate} className="grid gap-3">
                  <textarea
                    className="min-h-28 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Add a progress updateâ€¦"
                  />
                  <Button disabled={postingUpdate} type="submit">
                    {postingUpdate ? 'â³ Postingâ€¦' : 'âž• Add Update'}
                  </Button>
                </form>

                <div className="grid gap-3">
                  {updates.length === 0 ? (
                    <p className="text-sm font-semibold text-slate-500">No updates yet. Be the first to add one!</p>
                  ) : (
                    updates.map((u) => (
                      <article key={u.id} className="rounded-lg border border-slate-200 bg-linear-to-r from-white to-slate-50 p-4 transition hover:border-emerald-200 hover:shadow-sm">
                        <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">{u.content}</p>
                        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                          â° {u.created_at ? formatDate(u.created_at) : 'â€”'}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </CardBody>
              <CardFooter>
                <p className="text-xs font-semibold text-slate-500">
                  ðŸ’¡ Tip: Keep updates factual and include next action + ETA.
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
