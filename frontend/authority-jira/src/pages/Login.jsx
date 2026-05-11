import React, { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, ShieldAlert } from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
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
        setError(err?.message || 'Login failed')
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
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-slate-950">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">CivicFix Authority</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Sign in to manage civic issues</h1>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
            Use your municipal officer credentials. You will be able to triage reports, assign ownership, update
            status, and publish progress updates.
          </p>
        </div>

        <Card className="shadow-xl shadow-emerald-950/5">
          <CardHeader>
            <CardTitle>Officer Login</CardTitle>
            <CardDescription>Authenticate through the CivicFix backend.</CardDescription>
          </CardHeader>
          <CardBody>
            {pendingMemberId ? (
              <div className="flex flex-col items-center gap-5 py-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <ShieldAlert className="h-7 w-7 text-amber-600" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-black text-slate-900">Access not yet approved</p>
                  <p className="text-sm font-semibold text-slate-500">
                    Your account is pending approval from your organization admin. Click below to notify them.
                  </p>
                </div>

                {requested ? (
                  <div className="flex w-full items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Request sent! Your admin will approve your account shortly.
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleRequestAccess}
                      disabled={requesting}
                      className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {requesting ? 'Sending...' : 'Request Access from Admin'}
                    </button>
                    {requestError && (
                      <p className="text-xs font-bold text-rose-600">{requestError}</p>
                    )}
                  </>
                )}

                <button
                  onClick={() => { setPendingMemberId(null); setRequested(false) }}
                  className="text-xs font-bold text-slate-500 underline underline-offset-2"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form className="grid gap-4" onSubmit={onSubmit}>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Email</span>
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Password</span>
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                    {error}
                  </div>
                ) : null}

                <Button disabled={submitting} className="w-full" type="submit">
                  {submitting ? (
                    <>
                      <Loader size="sm" label="Signing in" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <p className="text-xs font-semibold text-slate-500">
                  Needs access? Ask your administrator to provision your authority account.
                </p>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Login
