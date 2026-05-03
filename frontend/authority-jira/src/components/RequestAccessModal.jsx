import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle } from 'lucide-react'

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

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    if (error) {
      setError('')
    }
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    // Validation: Check all fields are filled
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.department ||
      !formData.role
    ) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    // Validation: Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      // Simulate API call (replace with actual API call)
      await new Promise((resolve) => {
        setTimeout(resolve, 1000)
      })

      console.log('Request submitted:', formData)
      setSubmitted(true)
      setLoading(false)

      // Auto close modal after success
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ fullName: '', email: '', department: '', role: '' })
        onClose()
      }, 2500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Don't render until modal is open
  if (!isOpen) {
    return null
  }

  const modalContent = (
    <>
      {/* Backdrop - semi-transparent overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />

      {/* Modal Container - scrollable if content too tall */}
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          {/* Modal Box */}
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(event) => {
              event.stopPropagation()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close modal"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {submitted ? (
                // Success State
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 id="modal-title" className="text-2xl font-bold text-slate-900">
                      Request Received!
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Thank you! We&apos;ll review your request and get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              ) : (
                // Form State
                <>
                  <div className="mb-6">
                    <h2 id="modal-title" className="text-2xl font-bold text-slate-900">
                      Request Officer Access
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Fill in your details below and we&apos;ll review your request shortly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Full Name Field */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-semibold text-slate-700 mb-2"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g., Rajesh Kumar"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-slate-700 mb-2"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., rajesh@city.gov"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                        required
                      />
                    </div>

                    {/* Department Field */}
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-xs font-semibold text-slate-700 mb-2"
                      >
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                        required
                      >
                        <option value="">— Select a department —</option>
                        <option value="roads">Roads &amp; Infrastructure</option>
                        <option value="sanitation">Sanitation</option>
                        <option value="public-works">Public Works</option>
                        <option value="water">Water Supply</option>
                        <option value="electricity">Electricity</option>
                      </select>
                    </div>

                    {/* Role Field */}
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-xs font-semibold text-slate-700 mb-2"
                      >
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                        required
                      >
                        <option value="">— Select a role —</option>
                        <option value="field-officer">Field Officer</option>
                        <option value="inspector">Inspector</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {error}
                      </div>
                    )}

                    {/* Form Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          'Request Access'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Footer Text */}
                    <p className="text-center text-xs text-slate-500 pt-2">
                      ✓ Response within 24 hours
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  // Render via portal to document.body to ensure modal is above all other elements
  return createPortal(modalContent, document.body)
}

export default RequestAccessModal