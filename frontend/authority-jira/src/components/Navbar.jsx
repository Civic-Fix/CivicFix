import { useState } from 'react'
import { navItems } from './landingData'
import RequestAccessModal from './RequestAccessModal'

function Navbar() {
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-950/[0.03] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-5 py-3 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#top"
            className="group flex shrink-0 items-center gap-3 rounded-xl text-slate-900 no-underline outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-sm font-black text-emerald-200 shadow-sm shadow-emerald-700/20 transition duration-300 group-hover:scale-105">
              CF
            </span>
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-semibold tracking-tight">
                Civic<span className="text-emerald-600">Fix</span>
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Authority Console
              </div>
            </div>
          </a>

          <nav className="hidden items-center rounded-full border border-slate-200 bg-slate-50/80 p-1 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 no-underline transition hover:bg-white hover:text-slate-950 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 xl:inline-flex">
              Live Beta
            </span>

            <a
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 no-underline transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:inline-flex"
            >
              Officer Login
            </a>

            <a
              href="#impact"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 md:inline-flex"
            >
              View Impact
            </a>

            <button
              onClick={() => setIsRequestAccessOpen(true)}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:px-5"
            >
              Request Access
            </button>
          </div>
        </div>
      </div>

      <RequestAccessModal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
      />
    </header>
  )
}

export default Navbar
