import React from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-black transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

const variants = {
  primary:
    'bg-blue-600 text-white shadow-sm shadow-blue-900/15 hover:bg-blue-700',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200 hover:text-blue-700 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-950/5 hover:text-slate-950',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
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
