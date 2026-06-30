const TONE = {
  good: '#0fa882',
  ok: '#3a6ea5',
  warn: '#ab7a2a',
  bad: '#bf4658',
}

export default function Ring({ value, tone = 'good', label }) {
  const size = 132
  const stroke = 11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100)
  const color = TONE[tone] || TONE.good

  return (
    <div className="ring-wrap">
      <svg width={size} height={size} className="ring">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bar-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" className="ring-num" dominantBaseline="central" textAnchor="middle">
          {value}
        </text>
      </svg>
      {label && (
        <span className="ring-label" style={{ color }}>{label}</span>
      )}
    </div>
  )
}
