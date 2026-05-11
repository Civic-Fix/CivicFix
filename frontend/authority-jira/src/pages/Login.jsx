import React, { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from 'lucide-react'
import Loader from '../components/ui/Loader'
import { useAuth } from '../hooks/useAuth'
import { requestMemberAccess } from '../services/teamService'

function Login() {
  const { user, loading, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(() => location.state?.from || '/dashboard', [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [pendingMemberId, setPendingMemberId] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [requestError, setRequestError] = useState('')

  if (!loading && user) return <Navigate to={from} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setPendingMemberId(null)
    setRequested(false)
    setSubmitting(true)
    try {
      await signInWithPassword({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      if (err?.payload?.code === 'NOT_VERIFIED') {
        setPendingMemberId(err.payload.memberId)
      } else {
        setError(err?.message || 'Login failed. Check your credentials.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRequestAccess() {
    if (!pendingMemberId) return
    setRequestError('')
    setRequesting(true)
    try {
      await requestMemberAccess(pendingMemberId)
      setRequested(true)
    } catch (err) {
      setRequestError(err?.message || 'Failed to send request')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_1fr]">

      {/* Left panel — branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">CivicFix</p>
            <p className="text-sm font-black text-white">Authority</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
            Manage civic issues<br />
            <span className="text-emerald-400">the smart way.</span>
          </h1>
          <p className="text-base font-medium leading-7 text-slate-400">
            Triage citizen reports, assign field teams, track resolution in real time,
            and publish progress updates to keep your city moving.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: 'Issues Managed', value: '12,400+' },
              { label: 'Avg. Resolution', value: '3.2 days' },
              { label: 'Satisfaction', value: '94%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xl font-black text-emerald-400">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <p className="relative text-xs font-semibold text-slate-600">
          Trusted by municipal authorities across India.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
            <ShieldCheck className="h-4.5 w-4.5 text-white" />
          </div>
          <p className="text-lg font-black text-slate-900">CivicFix Authority</p>
        </div>

        <div className="w-full max-w-sm">

          {pendingMemberId ? (
            /* Access pending screen */
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                <ShieldAlert className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Access Pending</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  Your account exists but has not been approved yet.
                  Notify your admin to get access.
                </p>
              </div>

              {requested ? (
                <div className="flex w-full items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-black text-emerald-800">Request sent!</p>
                    <p className="mt-0.5 text-xs font-medium text-emerald-700">
                      Your admin will see a notification in the Team page and can approve you.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <button
                    onClick={handleRequestAccess}
                    disabled={requesting}
                    className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {requesting ? 'Sending request...' : 'Request Access from Admin'}
                  </button>
                  {requestError && (
                    <p className="text-center text-xs font-bold text-rose-600">{requestError}</p>
                  )}
                </div>
              )}

              <button
                onClick={() => { setPendingMemberId(null); setRequested(false) }}
                className="text-sm font-bold text-slate-400 transition hover:text-slate-600"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            /* Login form */
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Sign in with your authority credentials to continue.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@municipality.gov"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader size="sm" label="Signing in" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs font-medium text-slate-400">
                No account? Contact your organization admin to be added.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
