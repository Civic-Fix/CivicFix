import { useEffect, useState } from 'react'
import { navItems } from './landingData'

function Navbar() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('civic-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('civic-dark', isDark)
    localStorage.setItem('civic-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <header className="sticky top-0 z-50 px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <nav className="theme-nav flex flex-1 items-center justify-between gap-3 rounded-3xl border border-white/80 bg-white/90 px-4 py-3 shadow-2xl shadow-emerald-950/10 ring-1 ring-slate-900/5 backdrop-blur-xl lg:px-6">
          <a href="#top" className="group flex items-center gap-3 text-slate-950">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-slate-950 text-sm font-black text-white shadow-lg shadow-emerald-700/25 transition duration-300 group-hover:scale-105 group-hover:shadow-emerald-700/35">
              CF
            </span>
            <span className="leading-tight">
              <span className="theme-brand-text block text-xl font-black tracking-tight">
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
                className="rounded-full px-5 py-2.5 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 xl:inline-flex">
              Live civic beta
            </span>
            <a
              href="#final-cta"
              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-xl shadow-emerald-700/25 transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-emerald-700/35 sm:px-5"
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
    </header>
  )
}

export default Navbar
