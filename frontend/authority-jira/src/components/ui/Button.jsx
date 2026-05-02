import React from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-black transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 disabled:pointer-events-none disabled:opacity-50'

const sizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const variants = {
  primary:
    'bg-emerald-600 text-white shadow-xl shadow-emerald-700/20 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-700/30',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-lg hover:shadow-slate-900/5',
  ghost: 'text-slate-700 hover:bg-slate-950/5 hover:text-slate-950',
  danger:
    'bg-rose-600 text-white shadow-xl shadow-rose-700/20 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-rose-700/30',
}

function cx(...tokens) {
  return tokens.filter(Boolean).join(' ')
}

function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  type,
  ...props
}) {
  const resolvedType = Comp === 'button' ? type ?? 'button' : undefined

  return (
    <Comp
      type={resolvedType}
      className={cx(base, sizes[size] ?? sizes.md, variants[variant] ?? variants.primary, className)}
      {...props}
    />
  )
}

export default Button
