import { useEffect, useState } from 'react'
import { navItems } from './landingData'
import RequestAccessModal from './RequestAccessModal'

function Navbar() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('civic-theme') === 'dark')
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('civic-dark', isDark)
    localStorage.setItem('civic-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <header className="sticky top-0 z-50 px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <nav className="theme-nav flex flex-1 items-center gap-6 rounded-3xl border border-white/80 bg-white/90 px-5 py-3 shadow-2xl shadow-emerald-950/10 ring-1 ring-slate-900/5 backdrop-blur-xl lg:px-8">
          <a href="#top" className="group flex shrink-0 items-center gap-2 text-slate-950">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 text-sm font-black text-white shadow-lg shadow-emerald-700/25 transition duration-300 group-hover:scale-105 group-hover:shadow-emerald-700/35">
              CF
            </span>
            <span className="leading-tight">
              <span className="theme-brand-text block text-lg font-black tracking-tight">
                Civic<span className="text-emerald-600">Fix</span>
              </span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Report. Track. Resolve.
              </span>
            </span>
          </a>

          <div className="theme-nav-links hidden items-center gap-1 rounded-full bg-stone-100/90 p-1 text-sm font-bold text-slate-600 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 xl:inline-flex">
              Live civic beta
            </span>
            <a
              href="/login"
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md sm:px-4"
            >
              Officer Login
            </a>
            <button
              onClick={() => setIsRequestAccessOpen(true)}
              className="rounded-2xl bg-slate-600 px-3 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-700/25 transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-slate-700 hover:shadow-slate-700/35 sm:px-4"
            >
              Request Access
            </button>
            <a
              href="#final-cta"
              className="rounded-2xl bg-emerald-600 px-3 py-2.5 text-sm font-black text-white shadow-xl shadow-emerald-700/25 transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-emerald-700/35 sm:px-4"
            >
              Report Issue
            </a>
          </div>
        </nav>

        <button
          type="button"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={isDark}
          onClick={() => setIsDark((current) => !current)}
          className="theme-toggle theme-bubble grid shrink-0 place-items-center border border-white/80 bg-white text-2xl shadow-2xl shadow-emerald-950/15 ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:border-emerald-200"
        >
          <span className="theme-bubble-icon" aria-hidden="true">
            {isDark ? '☀️' : '🌙'}
          </span>
        </button>
      </div>

      {/* Request Access Modal */}
      <RequestAccessModal isOpen={isRequestAccessOpen} onClose={() => setIsRequestAccessOpen(false)} />
    </header>
  )
}

export default Navbar
