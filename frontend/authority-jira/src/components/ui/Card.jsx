import React from 'react'

function cx(...tokens) {
  return tokens.filter(Boolean).join(' ')
}

function Card({ className, ...props }) {
  return (
    <section
      className={cx(
        'rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <header className={cx('border-b border-slate-100 px-6 py-5', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h2 className={cx('text-lg font-black tracking-tight text-slate-950', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cx('mt-1 text-sm font-semibold text-slate-500', className)} {...props} />
}

function CardBody({ className, ...props }) {
  return <div className={cx('px-6 py-5', className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return <footer className={cx('border-t border-slate-100 px-6 py-5', className)} {...props} />
}

export { CardHeader, CardTitle, CardDescription, CardBody, CardFooter }
export default Card
