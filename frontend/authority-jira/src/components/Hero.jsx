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
    <section id="top" className="relative -mt-20 overflow-hidden pt-28 sm:pt-36 lg:pt-44">
      <div className="ambient-grid absolute inset-0 -z-10"></div>
      <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl"></div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-8 sm:gap-12 sm:pt-12 lg:gap-14 lg:px-8 lg:pb-32 lg:pt-14">
        <div className="animate-rise max-w-5xl">
          <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm sm:mb-5">
            Civic reporting made transparent
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl sm:leading-[0.98] lg:text-8xl lg:leading-[0.94]">
            Fix Your City, <span className="text-emerald-600">One Report</span> at a Time
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-7 sm:text-xl sm:leading-9">
            CivicFix helps residents report potholes, garbage, broken lights, and other public issues while tracking
            every step toward resolution with community visibility.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <a
              href="#final-cta"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-black text-white shadow-2xl shadow-emerald-700/30 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-emerald-700/40 sm:px-8 sm:py-4"
            >
              Report an Issue
              <Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-base font-black text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-emerald-200 hover:bg-white hover:text-emerald-700 hover:shadow-lg hover:shadow-slate-900/5 sm:px-8 sm:py-4"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="issue-card group relative rounded-[1.75rem] border border-white/80 bg-white/85 p-3 shadow-2xl shadow-emerald-950/10 backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-emerald-950/20 sm:rounded-[2rem] sm:p-5">
          <div className="rounded-[1.35rem] bg-slate-950 p-4 text-white sm:rounded-[1.5rem] sm:p-5">
            <div className="mb-5 grid gap-4 sm:mb-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-semibold text-emerald-200">Live issue map</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Central Ward resolution board</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400">
                  Priority reports grouped by location, public support, and current civic-team action.
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

            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[62rem] grid-cols-3 gap-4 lg:min-w-0">
                {issueCards.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-2xl border border-white/80 bg-white p-4 text-slate-950 shadow-lg shadow-slate-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/15"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                          Issue #{issue.id}
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
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{issue.meta}</p>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full bg-emerald-500 ${issue.progress}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
