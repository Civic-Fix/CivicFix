import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  CalendarClock,
  Camera,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import { getIssueById } from '../services/issuesService'
import { formatDate } from '../utils/formatDate'

function PublicIssue() {
  const { issueId } = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadIssue() {
      setLoading(true)
      setError('')
      try {
        const data = await getIssueById(issueId, { auth: false })
        if (isMounted) setIssue(data)
      } catch (err) {
        if (isMounted) setError(err?.message || 'Unable to load this issue')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadIssue()
    return () => {
      isMounted = false
    }
  }, [issueId])

  const images = useMemo(() => (Array.isArray(issue?.images) ? issue.images : []), [issue])
  const createdBy = issue?.created_by_user?.name || issue?.created_by_user?.phone || 'CivicFix user'
  const coordinates =
    issue?.latitude != null && issue?.longitude != null
      ? `${Number(issue.latitude).toFixed(5)}, ${Number(issue.longitude).toFixed(5)}`
      : ''
  const imageCount = images.length
  const heroImage = images[0]
  const secondaryImages = images.slice(1, 4)

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 text-white no-underline">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-blue-500 text-xs font-black text-white">
              CF
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-blue-200">CivicFix</span>
              <span className="block max-w-28 truncate text-sm font-black tracking-tight text-white sm:max-w-none">
                Authority Desk
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 sm:inline-flex">
              Shared public report
            </span>
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-xs font-black leading-4 text-white no-underline shadow-sm transition hover:bg-blue-600"
              to="/"
            >
              <span className="hidden sm:inline">Open CivicFix</span>
              <span className="sm:hidden">Open</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-7">
        {loading ? (
          <div className="border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-8 max-w-2xl animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 max-w-lg animate-pulse rounded bg-slate-100" />
            <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_20rem]">
              <div className="h-80 animate-pulse bg-slate-100" />
              <div className="h-80 animate-pulse bg-slate-100" />
            </div>
          </div>
        ) : error ? (
          <div className="border border-rose-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-rose-50 text-rose-700">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-black text-rose-800">{error}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  The issue may have been removed, or the shared link may be incorrect.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            <section className="border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-5">
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Shared issue
                    </span>
                    <span className="text-xs font-bold text-slate-300">/</span>
                    <span className="min-w-0 break-all text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      {issue?.id}
                    </span>
                  </div>
                  <h1 className="mt-3 max-w-4xl text-[1.65rem] font-black leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                    {issue?.title || `Issue #${issue?.id}`}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <StatusBadge status={issue?.status || 'reported'} />
                    {issue?.verificationStatus === 'authority_verified' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-inset ring-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Authority verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 ring-1 ring-inset ring-amber-200">
                        Review pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid min-w-0 gap-3 border-t border-slate-100 pt-4 text-sm font-semibold leading-6 text-slate-600 lg:w-72 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    {issue?.created_at ? formatDate(issue.created_at) : 'Date unavailable'}
                  </span>
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="min-w-0 break-words">{issue?.locality || coordinates || 'No location provided'}</span>
                  </span>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1fr_21rem]">
              <div className="grid gap-5">
                <div className="border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-950">Evidence</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {imageCount ? `${imageCount} photo${imageCount === 1 ? '' : 's'} attached to this report.` : 'No photos were attached.'}
                      </p>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700">
                      <Camera className="h-5 w-5" />
                    </span>
                  </div>

                  {heroImage ? (
                    <div className="grid gap-3 bg-slate-50 p-3 sm:p-4 lg:grid-cols-[1fr_14rem]">
                      <a
                        href={heroImage}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex h-72 items-center justify-center overflow-hidden border border-slate-200 bg-white sm:h-96"
                      >
                        <img
                          src={heroImage}
                          alt="Primary issue proof"
                          className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                        />
                      </a>
                      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                        {secondaryImages.map((src, index) => (
                          <a
                            key={`${src}-${index}`}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex h-24 items-center justify-center overflow-hidden border border-slate-200 bg-white lg:h-28"
                          >
                            <img
                              src={src}
                              alt={`Issue proof ${index + 2}`}
                              className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.04]"
                            />
                          </a>
                        ))}
                        {imageCount > 4 ? (
                          <div className="grid h-24 place-items-center border border-slate-200 bg-white px-3 text-center text-xs font-black text-slate-500 lg:h-28">
                            +{imageCount - 4} more
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4">
                      <div className="grid h-56 place-items-center border border-dashed border-slate-300 bg-white text-center">
                        <div>
                          <Camera className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-3 text-sm font-bold text-slate-500">No photos attached</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <article className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-700">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-950">Report description</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Citizen-submitted context for this case.</p>
                    </div>
                  </div>
                  <p className="mt-5 whitespace-pre-wrap text-base font-semibold leading-8 text-slate-700">
                    {issue?.description || 'No description provided.'}
                  </p>
                </article>
              </div>

              <aside className="grid content-start gap-5">
                <section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <h2 className="text-base font-black tracking-tight text-slate-950">Case summary</h2>
                  <div className="mt-4 divide-y divide-slate-100">
                    <div className="py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Reported by</p>
                      <p className="mt-1 text-sm font-black text-slate-800">{createdBy}</p>
                    </div>
                    <div className="py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Location</p>
                      <p className="mt-1 text-sm font-black leading-6 text-slate-800">
                        {issue?.locality || 'No locality provided'}
                      </p>
                      {coordinates ? <p className="mt-1 text-xs font-semibold text-slate-500">{coordinates}</p> : null}
                    </div>
                    <div className="py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status</p>
                      <div className="mt-2">
                        <StatusBadge status={issue?.status || 'reported'} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                      <ThumbsUp className="h-4 w-4" />
                    </span>
                    <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{issue?.upvote_count || 0}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Upvotes</p>
                  </div>
                  <div className="border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-rose-50 text-rose-700">
                      <ThumbsDown className="h-4 w-4" />
                    </span>
                    <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{issue?.downvote_count || 0}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Downvotes</p>
                  </div>
                </section>

                <section className="border border-blue-100 bg-blue-50 p-4 sm:p-5">
                  <p className="text-sm font-black text-blue-900">Public share page</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-blue-800">
                    This page is read-only and reflects the latest issue details available from CivicFix.
                  </p>
                </section>
              </aside>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

export default PublicIssue
