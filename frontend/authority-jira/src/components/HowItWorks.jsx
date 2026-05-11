import Icon from './Icon'
import { steps } from './landingData'

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              One operating rhythm from citizen report to verified closure.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 lg:justify-self-end">
            CivicFix turns raw complaints into structured case work so departments can act quickly without losing
            the public record.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group border border-slate-200 bg-stone-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/10 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon name={step.icon} />
                </span>
                <span className="text-sm font-black uppercase tracking-[0.24em] text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-4 max-w-sm leading-7 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 border border-slate-200 bg-slate-950 p-5 text-white sm:grid-cols-3 sm:p-6">
          {['Ward queue ownership', 'Department-level SLAs', 'Public status updates'].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-bold text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
