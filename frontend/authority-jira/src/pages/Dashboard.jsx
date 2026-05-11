import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Circle,
  Clock3,
  Filter,
  ListChecks,
  MapPinned,
  ShieldCheck,
  Table2,
  Users,
} from 'lucide-react'
import Loader from '../components/ui/Loader'
import { getIssueStats, issueStatusOptions } from '../services/issuesService'

const statusMeta = {
  reported: {
    label: 'Reported',
    tone: 'bg-blue-50 text-blue-700 ring-blue-200',
    bar: 'bg-blue-500',
    description: 'New citizen reports waiting for verification.',
  },
  verified: {
    label: 'Verified',
    tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    bar: 'bg-emerald-500',
    description: 'Reports confirmed and ready for assignment.',
  },
  in_progress: {
    label: 'In Progress',
    tone: 'bg-amber-50 text-amber-700 ring-amber-200',
    bar: 'bg-amber-500',
    description: 'Assigned work currently moving with field teams.',
  },
  review: {
    label: 'Review',
    tone: 'bg-violet-50 text-violet-700 ring-violet-200',
    bar: 'bg-violet-500',
    description: 'Fixes awaiting officer or resident confirmation.',
  },
  completed: {
    label: 'Completed',
    tone: 'bg-teal-50 text-teal-700 ring-teal-200',
    bar: 'bg-teal-500',
    description: 'Verified resolutions ready for reporting.',
  },
  closed: {
    label: 'Closed',
    tone: 'bg-slate-100 text-slate-700 ring-slate-200',
    bar: 'bg-slate-500',
    description: 'Resolved cases archived from active queues.',
  },
  blocked: {
    label: 'Blocked',
    tone: 'bg-rose-50 text-rose-700 ring-rose-200',
    bar: 'bg-rose-500',
    description: 'Cases waiting on dependency, budget, or access.',
  },
}

const queueCards = [
  {
    title: 'Drainage overflow cluster',
    key: 'reported',
    area: 'Market Lane',
    meta: 'SLA risk today',
  },
  {
    title: 'Streetlight verification batch',
    key: 'review',
    area: 'Sector 8',
    meta: 'Proof requested',
  },
  {
    title: 'Sanitation follow-up',
    key: 'in_progress',
    area: 'Lake View',
    meta: 'Crew assigned',
  },
]

function pct(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

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

  const dashboard = useMemo(() => {
    const total = stats?.total ?? 0
    const open = stats?.open ?? 0
    const resolved = stats?.resolved ?? 0
    const blocked = stats?.byStatus?.blocked ?? 0
    const active = Math.max(total - resolved, 0)
    const resolutionRate = pct(resolved, total)

    const statuses = issueStatusOptions.map((option) => {
      const count = stats?.byStatus?.[option.value] ?? 0
      const meta = statusMeta[option.value] ?? {
        label: option.label,
        tone: 'bg-slate-100 text-slate-700 ring-slate-200',
        bar: 'bg-slate-500',
        description: 'Cases in this workflow state.',
      }
      return {
        ...option,
        ...meta,
        count,
        percent: pct(count, total),
      }
    })

    return { total, open, resolved, blocked, active, resolutionRate, statuses }
  }, [stats])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 lg:p-6">
      <div className="mx-auto max-w-[90rem] space-y-5">
        <section className="border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <span>Projects</span>
                <span>/</span>
                <span>Civic operations</span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Authority Dashboard
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Triage citizen issues, watch SLA risk, and move cases across the resolution workflow.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/issues"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-blue-700"
              >
                <Table2 className="h-4 w-4" />
                Open issues
              </a>
              <a
                href="/reports"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 no-underline transition hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </a>
            </div>
          </div>
        </section>

        {error ? (
          <div className="flex items-center gap-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Loader label="Loading dashboard" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Total cases',
                  value: dashboard.total,
                  detail: 'All citizen reports',
                  icon: ListChecks,
                  accent: 'text-slate-700',
                },
                {
                  label: 'Active work',
                  value: dashboard.active,
                  detail: `${dashboard.open} open and awaiting movement`,
                  icon: Clock3,
                  accent: 'text-blue-700',
                },
                {
                  label: 'Resolved',
                  value: dashboard.resolved,
                  detail: `${dashboard.resolutionRate}% resolution rate`,
                  icon: CheckCircle2,
                  accent: 'text-emerald-700',
                },
                {
                  label: 'Blocked',
                  value: dashboard.blocked,
                  detail: 'Needs escalation or dependency clearing',
                  icon: AlertCircle,
                  accent: 'text-rose-700',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <section key={item.label} className="border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                        <p className={`mt-2 text-3xl font-black tracking-tight ${item.accent}`}>{item.value}</p>
                      </div>
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-500">{item.detail}</p>
                  </section>
                )
              })}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <section className="border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-950">Resolution board</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Current work grouped like a Jira queue.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>

                <div className="grid gap-4 bg-slate-50 p-4 lg:grid-cols-3">
                  {queueCards.map((card) => {
                    const meta = statusMeta[card.key]
                    const count = stats?.byStatus?.[card.key] ?? 0
                    return (
                      <article key={card.title} className="border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${meta.tone}`}>
                            {meta.label}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{count} in queue</span>
                        </div>
                        <h3 className="mt-4 text-sm font-black leading-6 text-slate-950">{card.title}</h3>
                        <p className="mt-2 text-sm font-semibold text-slate-500">{card.area}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.meta}</span>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              <section className="border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-base font-black tracking-tight text-slate-950">Issues by status</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Clean labels, counts, and workflow share.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {dashboard.statuses.map((status) => (
                    <div key={status.value} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {status.value === 'reported' ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-950" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 text-slate-300" />
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-800">{status.label}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{status.description}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${status.tone}`}>
                          {status.count}
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full ${status.bar}`}
                          style={{ width: `${Math.max(status.percent, status.count ? 6 : 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  title: 'Team capacity',
                  text: 'Review officer queues and assignments.',
                  href: '/team',
                  icon: Users,
                },
                {
                  title: 'Hotspot map',
                  text: 'Inspect clusters by ward and locality.',
                  href: '/map',
                  icon: MapPinned,
                },
                {
                  title: 'Verification controls',
                  text: 'Track proof, closure quality, and audit trail.',
                  href: '/issues',
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className="group flex items-start gap-4 border border-slate-200 bg-white p-4 text-slate-950 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-black">{item.title}</span>
                      <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{item.text}</span>
                    </span>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-blue-600" />
                  </a>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
