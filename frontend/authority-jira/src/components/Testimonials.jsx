import { testimonials } from './landingData'

function Testimonials() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Testimonials</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Built for people who care about their city.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-emerald-950/10"
            >
              <blockquote className="text-lg font-semibold leading-8 text-slate-800">"{testimonial.quote}"</blockquote>
              <figcaption className="mt-8">
                <p className="font-black text-slate-950">{testimonial.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
