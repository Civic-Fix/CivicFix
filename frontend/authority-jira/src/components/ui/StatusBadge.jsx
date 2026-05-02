import React from 'react'

function cx(...tokens) {
  return tokens.filter(Boolean).join(' ')
}

const palette = {
  Open: 'bg-sky-100 text-sky-800 ring-sky-200',
  New: 'bg-sky-100 text-sky-800 ring-sky-200',
  Reported: 'bg-sky-100 text-sky-800 ring-sky-200',

  'In Progress': 'bg-amber-100 text-amber-800 ring-amber-200',
  Active: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Review: 'bg-violet-100 text-violet-800 ring-violet-200',

  Resolved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Closed: 'bg-slate-100 text-slate-700 ring-slate-200',
  Rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
  Urgent: 'bg-rose-100 text-rose-800 ring-rose-200',
  High: 'bg-rose-100 text-rose-800 ring-rose-200',
}

function StatusBadge({ status, className, ...props }) {
  const styles = palette[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'

  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-black tracking-wide ring-1 ring-inset',
        styles,
        className,
      )}
      {...props}
    >
      {status}
    </span>
  )
}

export default StatusBadge
