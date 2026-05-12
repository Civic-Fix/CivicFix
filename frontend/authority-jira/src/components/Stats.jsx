import { stats } from './landingData'

function Stats() {
  return (
    <>
      <section id="impact" className="bg-slate-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200">Impact</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Measure service delivery, not noise.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              CivicFix gives authorities and residents shared numbers: what was reported, who owns it, how long it
              waited, and whether the fix was verified.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border border-white/10 bg-white/10 p-7 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14] hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <strong className="text-4xl font-black text-emerald-200 sm:text-5xl">{stat.value}</strong>
                <p className="mt-3 font-bold text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="final-cta" className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 border border-slate-200 bg-gradient-to-br from-emerald-600 via-green-700 to-slate-950 p-7 text-white shadow-2xl shadow-emerald-900/20 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-100">Bring the desk online</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Give every civic issue a queue, an owner, and a visible outcome.
            </h2>
            <p className="mt-5 text-lg leading-8 text-emerald-50">
              Start with authority access for intake, triage, field updates, dashboards, and transparent closure.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            
            <a
              className="rounded-xl border border-white/30 px-6 py-4 text-center font-black text-white transition hover:-translate-y-1 hover:bg-white/10"
              href="/login"
            >
              Officer Login
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Stats
