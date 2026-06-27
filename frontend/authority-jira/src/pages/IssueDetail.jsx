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
  Save,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import StatusBadge from '../components/ui/StatusBadge'
import { getIssueById, issueStatusOptions, updateIssue, uploadIssueAttachmentAsset } from '../services/issuesService'
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
  const [newUpdateFiles, setNewUpdateFiles] = useState([])
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
    listTeamMembers().then(setTeamMembers).catch(() => { })
  }, [refresh])

  useEffect(() => {
    if (issue) setAssignedTo(issue.assigned_to || '')
  }, [issue?.assigned_to])

  // File picker handlers for update attachments
  async function handleUpdateFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    try {
      const readers = files.map((file) =>
        new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => {
            resolve({
              file_name: file.name,
              mime_type: file.type || 'image/jpeg',
              file_data_base64: fr.result,
              preview: fr.result,
            })
          }
          fr.onerror = reject
          fr.readAsDataURL(file)
        })
      )

      const results = await Promise.all(readers)
      setNewUpdateFiles((prev) => [...prev, ...results])
      // clear the input value so same file can be reselected if needed
      e.target.value = null
    } catch (err) {
      console.error('Failed to read files', err)
      setError('Unable to read selected files')
    }
  }

  function removeNewUpdateFile(index) {
    setNewUpdateFiles((prev) => prev.filter((_, i) => i !== index))
  }

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
    if (!content && newUpdateFiles.length === 0) return
    setPostingUpdate(true)
    setError('')
    try {
      const attachmentsPayload = []

      for (const f of newUpdateFiles) {
        const asset = await uploadIssueAttachmentAsset(f)
        if (!asset?.file_url) throw new Error('Attachment upload failed')
        attachmentsPayload.push({ file_url: asset.file_url })
      }

      await addUpdate({ issueId: issue.id, content, attachments: attachmentsPayload })
      setNewUpdate('')
      setNewUpdateFiles([])
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
      <div className="space-y-4 p-4 lg:p-6">
        <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white px-4 py-12 text-center">
          <Loader label="Loading issue" />
        </div>
      </div>
    )
  }

  if (error && !issue) {
    return (
      <div className="space-y-4 p-4 lg:p-6">
        <div className="grid gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-rose-100 px-4 py-3 text-sm font-bold text-rose-900 shadow-sm">
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
    <div className="space-y-6 p-4 lg:p-6">
      <div className="grid gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Issue Detail</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
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

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left Column */}
          <Card>
            <CardHeader>
              <div className="mb-4 flex items-start justify-between gap-6">
                <div className="flex-1">
                  <CardTitle className="text-lg">Citizen Report</CardTitle>
                  <CardDescription className="mt-1 text-sm">Submitted details, location, and supporting evidence.</CardDescription>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">Status</label>
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {issueStatusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" disabled={savingStatus} onClick={onSaveStatus} className="flex items-center justify-center gap-2 mt-1 w-full">
                    <Save className="h-4 w-4" />
                    {savingStatus ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">Assign To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => onAssign(e.target.value)}
                    disabled={savingAssignee}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25 disabled:bg-slate-50 disabled:opacity-70"
                  >
                    <option value="">-- Unassigned --</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  {savingAssignee && <p className="text-xs text-emerald-600 font-semibold">Saving...</p>}
                </div>
              </div>
            </CardHeader>
            <CardBody className="grid gap-3">
              <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                {issue?.description || '--'}
              </p>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Locality</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{issue?.locality || '--'}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Coordinates</p>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    {issue?.latitude != null && issue?.longitude != null
                      ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`
                      : 'No coordinates'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Issue ID</p>
                  <p className="mt-2 text-sm font-black text-slate-900">#{formatIssueId(issue?.id)}</p>
                </div>
              </div>

              {images.length ? (
                <div className="grid gap-2">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <Image className="h-4 w-4" />
                    Photos
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
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
                          className="h-32 w-full object-cover transition duration-300 group-hover:scale-105"
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
          <div className="grid gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Triage
                </CardTitle>
                <CardDescription className="mt-1 text-sm">Auto-categorization and duplicate detection from the issue database.</CardDescription>
              </CardHeader>
              <CardBody className="grid gap-3">
                {issue?.aiPending ? (
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
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
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Category</p>
                        <p className="mt-2 text-lg font-black text-blue-950">{issue?.categoryLabel || 'Uncategorized'}</p>
                        <p className="mt-1 text-xs font-bold text-blue-700">{aiConfidence || 'No confidence score'}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Severity</p>
                        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${severityStyles[issue?.aiSeverity] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                          {issue?.aiSeverity || 'Not set'}
                        </span>
                      </div>
                    </div>

                    {issue?.aiSummary ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Summary</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{issue.aiSummary}</p>
                      </div>
                    ) : null}

                    {issue?.aiDuplicateOf ? (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
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
                      <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
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
                <CardTitle className="text-lg">Updates</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Progress logs and officer comments.
                </CardDescription>
              </CardHeader>

              <CardBody className="grid gap-6">

                {/* COMPOSER BOX */}
                <form onSubmit={onAddUpdate} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm grid gap-3">

                  <textarea
                    className="min-h-20 resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Write an update..."
                  />

                  {/* ACTION ROW */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button disabled={postingUpdate} type="submit">
                        {postingUpdate ? "Posting..." : "Post"}
                      </Button>

                      <label
                        htmlFor="update-files-input"
                        className="inline-flex cursor-pointer items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                      >
                        <Image className="h-5 w-5" />
                      </label>
                    </div>

                    {/* optional hint */}
                    <p className="text-xs text-slate-400">Attach images if needed</p>
                  </div>

                  <input
                    id="update-files-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpdateFilesSelected}
                    className="hidden"
                  />

                  {/* ATTACHMENT PREVIEW */}
                  {newUpdateFiles.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-100">
                      {newUpdateFiles.map((f, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={f.preview}
                            alt={f.file_name}
                            className="h-14 w-14 rounded-md object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewUpdateFile(idx)}
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-rose-600 text-white text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>

                {/* TIMELINE FEED */}
                <div className="relative grid gap-4">

                  {updates.length === 0 ? (
                    <div className="text-sm text-slate-500 font-semibold text-center py-6">
                      No updates yet
                    </div>
                  ) : (
                    updates.map((u) => (
                      <div key={u.id} className="relative pl-4 border-l border-slate-200">

                        {/* DOT */}
                        <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                        <article className="rounded-lg bg-white border border-slate-200 p-3 hover:shadow-sm transition">

                          <p className="whitespace-pre-wrap text-sm font-medium text-slate-700">
                            {u.content}
                          </p>

                          {Array.isArray(u.update_attachments) && u.update_attachments.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {u.update_attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="overflow-hidden rounded-md border bg-slate-50"
                                >
                                  <img
                                    src={att.file_url}
                                    alt="attachment"
                                    className="h-28 w-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                          <p className="mt-2 text-xs text-slate-400 font-semibold">
                            {u.created_at ? formatDate(u.created_at) : "--"}
                          </p>
                        </article>
                      </div>
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
