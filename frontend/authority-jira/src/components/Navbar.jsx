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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <a href="#top" className="group flex shrink-0 items-center gap-2.5 text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 text-sm font-black text-white shadow-md shadow-emerald-700/30 transition duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-700/40">
              CF
            </span>
            <div className="hidden leading-tight sm:block">
              <div className="text-base font-black tracking-tight">
                Civic<span className="text-emerald-600">Fix</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Civic Platform</div>
            </div>
          </a>

          {/* Navigation Links - Desktop Only */}
          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-700 transition duration-200 hover:text-emerald-600 hover:-translate-y-0.5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Beta Badge */}
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 xl:inline-block">
              Live Beta
            </span>

            {/* Officer Login */}
            <a
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition duration-300 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 sm:text-sm"
            >
              Officer Login
            </a>

            {/* Request Access */}
            <button
              onClick={() => setIsRequestAccessOpen(true)}
              className="rounded-lg bg-slate-700 px-3.5 py-2 text-xs font-bold text-white shadow-md transition duration-300 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 sm:text-sm"
            >
              Request Access
            </button>

            {/* Report Issue */}
            <a
              href="#final-cta"
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition duration-300 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 sm:text-sm"
            >
              Report Issue
            </a>

            {/* Theme Toggle */}
            <button
              type="button"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
              onClick={() => setIsDark((current) => !current)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-lg transition duration-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Request Access Modal */}
      <RequestAccessModal isOpen={isRequestAccessOpen} onClose={() => setIsRequestAccessOpen(false)} />
    </header>
  )
}

export default Navbar
