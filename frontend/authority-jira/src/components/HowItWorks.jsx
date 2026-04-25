import Icon from './Icon'
import { steps } from './landingData'

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">How it works</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Report, track, and resolve without losing visibility.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            CivicFix turns local complaints into structured cases that communities and city teams can act on.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group rounded-3xl border border-slate-200 bg-stone-50 p-8 transition duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/10"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon name={step.icon} />
                </span>
                <span className="text-5xl font-black text-slate-200">0{index + 1}</span>
              </div>
              <h3 className="mt-9 text-2xl font-black tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-4 max-w-sm leading-7 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
