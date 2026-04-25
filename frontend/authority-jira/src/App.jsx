import './App.css'

const navItems = ['How it works', 'Features', 'Impact']

const steps = [
  {
    title: 'Report',
    text: 'Upload a photo, pin the location, and describe the civic issue in under a minute.',
    icon: 'camera',
  },
  {
    title: 'Track',
    text: 'Follow status changes, civic body updates, and community activity from one timeline.',
    icon: 'map',
  },
  {
    title: 'Resolve',
    text: 'See verified fixes, share feedback, and keep public teams accountable.',
    icon: 'check',
  },
]

const features = [
  {
    title: 'Report with photo & location',
    text: 'Capture potholes, garbage piles, broken streetlights, and drainage issues with proof and precise location.',
    icon: 'camera',
  },
  {
    title: 'Real-time tracking',
    text: 'Every issue gets a transparent timeline from submitted to acknowledged, assigned, in progress, and resolved.',
    icon: 'clock',
  },
  {
    title: 'Community upvotes',
    text: 'Residents can support important reports so local authorities understand what matters most right now.',
    icon: 'users',
  },
  {
    title: 'Transparency dashboard',
    text: 'Public dashboards reveal resolution rates, response times, issue hotspots, and department performance.',
    icon: 'chart',
  },
]

const stats = [
  { value: '12,480+', label: 'issues resolved' },
  { value: '38k', label: 'active users' },
  { value: '24', label: 'cities covered' },
]

const testimonials = [
  {
    quote:
      'CivicFix made our neighborhood reports visible. We finally had one place to track what was being fixed.',
    name: 'Ananya Rao',
    role: 'Resident volunteer',
  },
  {
    quote:
      'The dashboard helped our ward team prioritize complaints by urgency and public impact.',
    name: 'Marcus Chen',
    role: 'City operations lead',
  },
  {
    quote:
      'Upvotes turned scattered complaints into clear community signals. It changed how quickly issues moved.',
    name: 'Leila Morgan',
    role: 'Civic organizer',
  },
]

function Icon({ name, className = 'h-6 w-6' }) {
  const commonProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  const paths = {
    camera: (
      <>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
        <path d="M9 12.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      </>
    ),
    map: (
      <>
        <path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    check: (
      <>
        <path d="M20 7 10 17l-5-5" />
        <path d="M12 22c5.2 0 9-3.8 9-9V7l-9-4-9 4v6c0 5.2 3.8 9 9 9Z" />
      </>
    ),
    clock: (
      <>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    users: (
      <>
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M20 19c0-1.7-1.1-3.1-2.6-3.7" />
        <path d="M17 6.3a2.5 2.5 0 0 1 0 4.9" />
        <path d="M4 19c0-1.7 1.1-3.1 2.6-3.7" />
        <path d="M7 6.3a2.5 2.5 0 0 0 0 4.9" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  }

  return (
    <svg {...commonProps} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-900/10 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-3 font-black text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-700/20">
            CF
          </span>
          <span className="text-lg">CivicFix</span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} className="transition hover:text-emerald-700">
              {item}
            </a>
          ))}
        </div>

        <a
          href="#final-cta"
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          Report Issue
        </a>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 lg:pt-32">
      <div className="ambient-grid absolute inset-0 -z-10"></div>
      <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl"></div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28">
        <div className="animate-rise">
          <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
            Civic reporting made transparent
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Fix Your City, One Report at a Time
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CivicFix helps residents report potholes, garbage, broken lights, and other public issues while tracking
            every step toward resolution with community visibility.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#final-cta"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white shadow-xl shadow-emerald-700/25 transition hover:-translate-y-1 hover:bg-emerald-700"
            >
              Report an Issue
              <Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:text-emerald-700"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="issue-card relative rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300">Live issue map</p>
                <h2 className="text-2xl font-black">Central Ward</h2>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-200">
                42 open
              </span>
            </div>

            <div className="grid gap-3">
              {['Pothole near school gate', 'Garbage pickup missed', 'Streetlight outage'].map((issue, index) => (
                <div key={issue} className="rounded-2xl bg-white p-4 text-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Issue #{1048 + index}</p>
                      <h3 className="mt-1 font-black">{issue}</h3>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                      {index === 0 ? 'High' : 'New'}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full bg-emerald-500 ${index === 0 ? 'w-3/4' : 'w-1/2'}`}></div>
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

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-lg leading-8 text-slate-600">{text}</p>}
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="Report, track, and resolve without losing visibility."
          text="CivicFix turns local complaints into structured cases that communities and city teams can act on."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-2 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/10"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon name={step.icon} />
                </span>
                <span className="text-5xl font-black text-slate-200">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-2xl font-black text-slate-950">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Features"
          title="A civic workflow that feels clear from day one."
          text="Designed for residents, moderators, local officials, and community leaders."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-900/10"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-emerald-300">
                <Icon name={feature.icon} />
              </span>
              <h3 className="mt-7 text-2xl font-black text-slate-950">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Impact() {
  return (
    <section id="impact" className="bg-slate-950 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-300">Impact</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Measure what gets fixed.</h2>
          </div>
          <p className="text-lg leading-8 text-slate-300">
            CivicFix gives communities shared numbers instead of scattered conversations, helping everyone understand
            where public services are improving and where attention is still needed.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur">
              <strong className="text-4xl font-black text-emerald-300 sm:text-5xl">{stat.value}</strong>
              <p className="mt-3 font-bold text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader eyebrow="Testimonials" title="Built for people who care about their city." />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
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

function FinalCTA() {
  return (
    <section id="final-cta" className="px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-950 p-8 text-white shadow-2xl shadow-emerald-900/20 sm:p-12 lg:p-16">
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
          <a className="rounded-2xl bg-white px-6 py-4 text-center font-black text-emerald-700 transition hover:-translate-y-1" href="mailto:hello@civicfix.dev">
            Request Access
          </a>
          <a className="rounded-2xl border border-white/30 px-6 py-4 text-center font-black text-white transition hover:-translate-y-1 hover:bg-white/10" href="#top">
            Back to top
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright 2026 CivicFix. Built for cleaner, safer neighborhoods.</p>
        <div className="flex gap-5">
          <a className="transition hover:text-emerald-700" href="#features">
            Features
          </a>
          <a className="transition hover:text-emerald-700" href="#impact">
            Impact
          </a>
          <a className="transition hover:text-emerald-700" href="#final-cta">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Impact />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  )
}