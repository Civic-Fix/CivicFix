import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/ui/Loader'
import Button from '../components/ui/Button'
import { listIssues } from '../services/issuesService'

function Map() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const [issues, setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const center = useMemo(() => [22.5726, 88.3639], [])

  async function refresh() {
    setError('')
    setLoading(true)
    try {
      const data = await listIssues()
      setIssues(data)
    } catch (err) {
      setError(err?.message || 'Failed to load issues for map')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const interval = window.setInterval(refresh, 15000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 12)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [center])

  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.clearLayers()

    const markers = []

    for (const issue of issues) {
      const lat = Number(issue.latitude)
      const lng = Number(issue.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

      const marker = L.marker([lat, lng])
      marker.bindTooltip(`${issue.title || `Issue #${issue.id}`}`, { permanent: false, direction: 'top' })
      marker.on('click', () => {
        setSelectedIssue(issue)
      })
      marker.addTo(layerRef.current)
      markers.push(marker)
    }

    if (markers.length && mapRef.current) {
      const group = L.featureGroup(markers)
      mapRef.current.fitBounds(group.getBounds().pad(0.2))
    }
  }, [issues])

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header with Gradient */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Map</p>
            <h1 className="bg-linear-to-r from-slate-950 via-slate-800 to-emerald-950 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Issue Locations
            </h1>
            <p className="text-base font-semibold text-slate-600">Click a marker to view open issue details, then jump to its page.</p>
          </div>
          <Button variant="secondary" onClick={refresh}>Refresh</Button>
        </div>
        <div className="h-1 w-16 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600"></div>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-rose-100 px-5 py-4 text-sm font-bold text-rose-900 shadow-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white px-5 py-16 text-center">
          <Loader label="Loading map issues" />
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-slate-700">
            Showing <span className="font-black text-emerald-600">{issues.length}</span> open civic issues in real time
          </span>
          <span className="text-sm text-slate-500">Auto-refresh every 15 seconds</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg">
        <div ref={containerRef} className="h-[32rem] w-full bg-slate-100" />
      </div>

      {selectedIssue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Issue detail</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{selectedIssue.title || `Issue #${selectedIssue.id}`}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-semibold text-slate-600">{selectedIssue.locality || 'Location not available'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{selectedIssue.description || 'No description provided.'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-black text-slate-950">Status</p>
                <p className="mt-1">{selectedIssue.statusLabel || selectedIssue.status}</p>
                <p className="mt-4 font-black text-slate-950">Votes</p>
                <p className="mt-1">{selectedIssue.votes ?? 0}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={() => navigate(`/issues/${selectedIssue.id}`)}>Open issue page</Button>
              <Button variant="secondary" onClick={() => setSelectedIssue(null)}>Dismiss</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Map
