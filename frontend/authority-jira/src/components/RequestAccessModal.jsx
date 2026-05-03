import React, { useState } from 'react'
import { X } from 'lucide-react'

function RequestAccessModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    role: '',
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
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      // TODO: Replace with actual API call to backend
      // await api.post('/access-requests', formData)
      console.log('Request submitted:', formData)

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ fullName: '', email: '', department: '', role: '' })
        onClose()
      }, 2000)
    } catch (err) {
      setError(err?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 hover:bg-slate-100"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            // Success State
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950">Request Received!</h2>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Check your email for updates. Our team will review your request within 24 hours.
              </p>
            </div>
          ) : (
            // Form State
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950">Request Officer Access</h2>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Fill out the form below and our admin team will review your request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Full Name
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., Rajesh Kumar"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  />
                </label>

                {/* Email */}
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Email Address
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., rajesh@city.gov"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  />
                </label>

                {/* Department */}
                <label className="block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Department
                  </span>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
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
                    Role
                  </span>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option value="">Select a role</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Field Officer">Field Officer</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
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
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Request Access'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>

                {/* Footer Note */}
                <p className="text-center text-xs font-medium text-slate-600">
                  You'll receive a response email within 24 hours.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestAccessModal
