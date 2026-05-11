function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-5 py-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright 2026 CivicFix. Built for accountable civic response.</p>
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

export default Footer
