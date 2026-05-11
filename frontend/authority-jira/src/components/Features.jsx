import Icon from './Icon'
import { features } from './landingData'

function Features() {
  return (
    <section id="features" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Platform</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Everything a civic response desk needs to keep work moving.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 lg:justify-self-end">
            Built for repeated daily use by officers, supervisors, field teams, and citizen service cells.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10 sm:p-7"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-emerald-200">
                <Icon name={feature.icon} />
              </span>
              <h3 className="mt-7 text-2xl font-black tracking-tight text-slate-950">{feature.title}</h3>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 overflow-hidden border border-slate-200 bg-white">
          <div className="grid divide-y divide-slate-200 lg:grid-cols-[0.9fr_1.1fr] lg:divide-x lg:divide-y-0">
            <div className="p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Command view</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Sort work by what matters now.
              </h3>
              <p className="mt-4 leading-7 text-slate-600">
                Filter cases by ward, department, age, priority, verification status, and location cluster without
                leaving the board.
              </p>
            </div>
            <div className="grid gap-3 bg-slate-950 p-5 sm:p-6">
              {[
                ['SLA risk', '11 cases need action before 6 PM', 'text-rose-200'],
                ['Duplicate cluster', '7 reports merged near Bus Depot', 'text-sky-200'],
                ['Field update', 'Technician uploaded proof for Case #1050', 'text-emerald-200'],
              ].map(([label, text, color]) => (
                <div key={label} className="border border-white/10 bg-white/10 p-4">
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${color}`}>{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
