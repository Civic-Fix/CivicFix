import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

function EmailVerified() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-4xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5 sm:p-14">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-200">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Email Verified
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Your email account is verified, now you can proceed to sign in into the CivicFix App.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-4">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerified
