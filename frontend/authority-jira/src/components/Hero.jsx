import Icon from './Icon'
import { issueCards } from './landingData'

function Hero() {
  const statusStyles = {
    Active: 'bg-emerald-100 text-emerald-700',
    High: 'bg-amber-100 text-amber-700',
    New: 'bg-sky-100 text-sky-700',
    Queued: 'bg-slate-100 text-slate-700',
    Review: 'bg-violet-100 text-violet-700',
    Urgent: 'bg-rose-100 text-rose-700',
  }

  return (
    <section id="top" className="relative -mt-20 overflow-hidden pt-28 sm:pt-34 lg:pt-40">
      <div className="ambient-grid absolute inset-0 -z-10"></div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:gap-12 sm:pt-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="animate-rise max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm sm:mb-5">
            Civic operations, built for public accountability
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl sm:leading-[0.98] lg:text-7xl lg:leading-[0.94]">
            CivicFix turns citizen reports into <span className="text-emerald-600">resolved city work</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-7 sm:text-xl sm:leading-9">
            A shared command center for local authorities to receive complaints, prioritize field work, assign teams,
            publish updates, and prove what changed on the ground.
          </p>

          <div className="mt-7 grid gap-3 sm:mt-10 sm:flex-row sm:flex">
            <a
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-base font-black text-white shadow-xl shadow-slate-900/20 transition duration-300 hover:-translate-y-1 hover:bg-emerald-700 sm:px-8 sm:py-4"
            >
              Open Authority Portal
              <Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-base font-black text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:text-emerald-700 hover:shadow-lg hover:shadow-slate-900/5 sm:px-8 sm:py-4"
            >
              View workflow
            </a>
          </div>

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-3 border-y border-slate-200/80 py-5 sm:mt-10">
            {[
              ['4.8h', 'avg. first action'],
              ['92%', 'geo-tagged reports'],
              ['7', 'active queues'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-black text-slate-950">{value}</dt>
                <dd className="mt-1 text-xs font-bold uppercase leading-5 tracking-wide text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="issue-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/10">
          <div className="border-b border-slate-200 bg-slate-950 p-4 text-white sm:p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-semibold text-emerald-200">Authority workspace preview</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Central Ward triage board</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400">
                  Priority reports grouped by SLA risk, public support, department, and field-team action.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-sm font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  42 open
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-slate-200 ring-1 ring-white/10">
                  18 in progress
                </span>
              </div>
            </div>
          </div>

          <div className="grid border-b border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 sm:grid-cols-4">
            {['Intake', 'Assigned', 'Field work', 'Verification'].map((label) => (
              <div key={label} className="border-b border-slate-200 px-4 py-3 sm:border-b-0 sm:border-r last:sm:border-r-0">
                {label}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto p-4 sm:p-5">
            <div className="grid min-w-[48rem] grid-cols-3 gap-4 lg:min-w-0">
              {issueCards.slice(0, 6).map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Case #{issue.id}
                      </p>
                      <h3 className="mt-2 text-base font-black leading-snug">{issue.title}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[issue.status]}`}>
                      {issue.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-slate-400">
                    <span>{issue.area}</span>
                    <span>{issue.votes} votes</span>
                  </div>
                  <p className="mt-3 min-h-12 text-sm font-semibold leading-6 text-slate-500">{issue.meta}</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full bg-emerald-500 ${issue.progress}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
