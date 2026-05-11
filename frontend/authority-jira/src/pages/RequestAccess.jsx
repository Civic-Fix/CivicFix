import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

function RequestAccessPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    role: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate form
    if (!formData.fullName || !formData.email || !formData.department || !formData.role) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      // TODO: Replace with actual API call to backend
      // await api.post('/access-requests', formData)
      console.log('Request submitted:', formData)

      setSubmitted(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      setError(err?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-slate-50 to-emerald-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {submitted ? (
          // Success Page
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg sm:p-12">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-950">Request Submitted!</h1>
              <p className="mt-4 text-lg font-semibold text-slate-700">
                Thank you for requesting access to CivicFix Authority.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl bg-emerald-50 p-6">
                <p className="text-sm font-bold text-emerald-900">âœ“ What happens next:</p>
                <ul className="space-y-3 text-left text-sm font-semibold text-emerald-800">
                  <li>âœ“ Our admin team will review your request</li>
                  <li>âœ“ You'll receive a confirmation email within 24 hours</li>
                  <li>âœ“ If approved, login credentials will be sent to your email</li>
                  <li>âœ“ You can then access the CivicFix dashboard</li>
                </ul>
              </div>

              <p className="mt-8 text-xs font-medium text-slate-600">
                Redirecting to home page in 3 seconds...
              </p>
            </div>
          </div>
        ) : (
          // Form Page
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-950">Request Officer Access</h1>
              <p className="mt-3 text-lg font-semibold text-slate-700">
                Join the CivicFix Authority platform and help manage civic issues in your municipality.
              </p>
              <p className="mt-3 text-sm font-medium text-slate-600">
                Fill out the form below and our admin team will review your request. You'll receive an email with access credentials within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <label className="block space-y-2 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Full Name *
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., Rajesh Kumar"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  />
                </label>

                {/* Email */}
                <label className="block space-y-2 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Email Address *
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., rajesh@city.gov"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  />
                </label>

                {/* Department */}
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Department *
                  </span>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option value="">Select a department</option>
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Public Works">Public Works</option>
                    <option value="Community Relations">Community Relations</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Parks & Gardens">Parks & Gardens</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                {/* Role */}
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Role *
                  </span>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option value="">Select a role</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Field Officer">Field Officer</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </label>
              </div>

              {/* Optional Message */}
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Message (Optional)
                </span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us why you need access (e.g., team responsibility, specific projects)"
                  rows="4"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                />
              </label>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Request Access'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {/* Footer Info */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-700">â„¹ï¸ How it works:</p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Submit your request above. Our admin team will review it and send you login credentials via email. Once approved, you can sign in to access the CivicFix Authority dashboard.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestAccessPage
