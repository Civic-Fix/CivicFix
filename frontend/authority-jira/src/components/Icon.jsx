function Icon({ name, className = 'h-6 w-6' }) {
  const commonProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  const paths = {
    camera: (
      <>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
        <path d="M9 12.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      </>
    ),
    map: (
      <>
        <path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    check: (
      <>
        <path d="M20 7 10 17l-5-5" />
        <path d="M12 22c5.2 0 9-3.8 9-9V7l-9-4-9 4v6c0 5.2 3.8 9 9 9Z" />
      </>
    ),
    clock: (
      <>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    users: (
      <>
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M20 19c0-1.7-1.1-3.1-2.6-3.7" />
        <path d="M17 6.3a2.5 2.5 0 0 1 0 4.9" />
        <path d="M4 19c0-1.7 1.1-3.1 2.6-3.7" />
        <path d="M7 6.3a2.5 2.5 0 0 0 0 4.9" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  }

  return (
    <svg {...commonProps} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

export default Icon
