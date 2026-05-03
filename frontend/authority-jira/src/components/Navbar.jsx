import { useState } from 'react'
import { navItems } from './landingData'
import RequestAccessModal from './RequestAccessModal'

function Navbar() {
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex items-center justify-between gap-6">

          {/* Logo & Brand */}
          <a href="#top" className="group flex shrink-0 items-center gap-3 text-slate-900">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-slate-900 text-sm font-black text-white shadow-sm shadow-emerald-700/20 transition duration-300 group-hover:scale-105">
              CF
            </span>
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-semibold tracking-tight">
                Civic<span className="text-emerald-600">Fix</span>
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Civic Platform
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {/* Beta Badge */}
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 xl:inline-block">
              Live Beta
            </span>

            {/* Officer Login (minimal) */}
            <a
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Officer Login
            </a>

            {/* Report Issue (secondary) */}
            <a
              href="#final-cta"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Report Issue
            </a>

            {/* Request Access (primary CTA) */}
            <button
              onClick={() => setIsRequestAccessOpen(true)}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Request Access
            </button>

          </div>
        </div>
      </div>

      {/* Request Access Modal */}
      <RequestAccessModal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
      />
    </header>
  )
}

export default Navbar