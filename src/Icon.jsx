// Ühtses joonstiilis ikoonid (Lucide-laadne)

const PATHS = {
  month: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </>
  ),
  bills: (
    <>
      <path d="M5 3h14a1 1 0 0 1 1 1v17l-3-2-2.5 2-2.5-2-2.5 2L8 20l-3 2V4a1 1 0 0 1 1-1Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  invest: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  settings: (
    <>
      <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3" />
      <path d="M14 2v4M8 10v4M16 18v4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.3 9.3 0 0 1 12 6c6.5 0 10 6 10 6a16.4 16.4 0 0 1-3.3 3.9M6.5 6.6A16.3 16.3 0 0 0 2 12s3.5 7 10 7a9.2 9.2 0 0 0 3.6-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
}

export default function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
