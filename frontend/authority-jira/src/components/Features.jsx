import Icon from './Icon'
import { features } from './landingData'

function Features() {
  return (
    <section id="features" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Features</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            A civic workflow that feels clear from day one.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Designed for residents, moderators, local officials, and community leaders.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-950/10"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-emerald-200">
                <Icon name={feature.icon} />
              </span>
              <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-950">{feature.title}</h3>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
