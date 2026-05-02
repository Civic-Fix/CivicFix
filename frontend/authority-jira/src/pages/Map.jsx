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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const center = useMemo(() => [22.5726, 88.3639], []) // default: Kolkata (can be overridden later)

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
      marker.bindPopup(
        `<div style="min-width: 220px">
          <div style="font-weight: 800; margin-bottom: 4px;">${escapeHtml(issue.title || `Issue #${issue.id}`)}</div>
          <div style="color: #475569; font-weight: 600; margin-bottom: 8px;">${escapeHtml(issue.locality || '')}</div>
          <button data-issue-id="${issue.id}" style="background:#059669;color:white;border:none;border-radius:12px;padding:8px 10px;font-weight:800;cursor:pointer;">
            Open issue
          </button>
        </div>`,
      )

      marker.on('popupopen', (e) => {
        const el = e.popup.getElement()
        const btn = el?.querySelector?.('button[data-issue-id]')
        if (!btn) return
        btn.addEventListener(
          'click',
          () => {
            navigate(`/issues/${issue.id}`)
          },
          { once: true },
        )
      })

      marker.addTo(layerRef.current)
      markers.push(marker)
    }

    if (markers.length && mapRef.current) {
      const group = L.featureGroup(markers)
      mapRef.current.fitBounds(group.getBounds().pad(0.2))
    }
  }, [issues, navigate])

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Map</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Issue locations</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">Click a marker to open the issue.</p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-10">
          <Loader label="Loading map issues" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div ref={containerRef} className="h-[32rem] w-full bg-slate-100" />
      </div>
    </div>
  )
}

function escapeHtml(input) {
  const str = String(input ?? '')
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export default Map
