import React, { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Loader from '../components/ui/Loader'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const { user, loading, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(() => location.state?.from || '/dashboard', [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user) return <Navigate to={from} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInWithPassword({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-slate-950">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">CivicFix Authority</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Sign in to manage civic issues</h1>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
            Use your municipal officer credentials. You’ll be able to triage reports, assign ownership, update status,
            and publish progress updates.
          </p>
        </div>

        <Card className="shadow-xl shadow-emerald-950/5">
          <CardHeader>
            <CardTitle>Officer Login</CardTitle>
            <CardDescription>Authenticate through the CivicFix backend.</CardDescription>
          </CardHeader>
          <CardBody>
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
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              <p className="text-xs font-semibold text-slate-500">
                Needs access? Ask your administrator to provision your authority account.
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Login
