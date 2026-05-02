import { stats } from './landingData'

function Stats() {
  return (
    <>
      <section id="impact" className="bg-slate-950 py-24 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200">Impact</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Measure what gets fixed.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              CivicFix gives communities shared numbers instead of scattered conversations, helping everyone understand
              where public services are improving and where attention is still needed.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur transition duration-300 hover:-translate-y-2 hover:bg-white/[0.14] hover:shadow-2xl hover:shadow-emerald-950/20"
              >
                <strong className="text-4xl font-black text-emerald-200 sm:text-5xl">{stat.value}</strong>
                <p className="mt-3 font-bold text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="final-cta" className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-green-700 to-slate-950 p-8 text-white shadow-2xl shadow-emerald-900/20 sm:p-12 lg:p-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-100">Start with one report</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Give your community a transparent way to fix civic issues.
            </h2>
            <p className="mt-5 text-lg leading-8 text-emerald-50">
              Launch CivicFix with issue reporting, public tracking, upvotes, and accountability dashboards.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="rounded-2xl bg-white px-6 py-4 text-center font-black text-emerald-700 transition duration-300 hover:-translate-y-1"
              href="mailto:kaushikharsha2020@gmail.com"
            >
              Request Access
            </a>
            <a
              className="rounded-2xl border border-white/30 px-6 py-4 text-center font-black text-white transition hover:-translate-y-1 hover:bg-white/10"
              href="#top"
            >
              Back to top
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Stats
