import React from 'react'

function cx(...tokens) {
  return tokens.filter(Boolean).join(' ')
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]',
}

function Loader({ size = 'md', label = 'Loading', className, ...props }) {
  return (
    <div className={cx('inline-flex items-center gap-3 text-sm font-bold text-slate-600', className)} {...props}>
      <span
        className={cx(
          'animate-spin rounded-full border-slate-200 border-t-emerald-600',
          sizes[size] ?? sizes.md,
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default Loader
