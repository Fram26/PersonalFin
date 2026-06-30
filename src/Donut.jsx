// Donut-graafik: sissetulek jaguneb ämbriteks + jääk.

export default function Donut({ segments, size = 180, stroke = 26, centerTop, centerSub, centerColor }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0)
  let acc = 0

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="donut">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bar-track)" strokeWidth={stroke} />
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {total > 0 &&
          segments.map((seg, i) => {
            if (seg.value <= 0) return null
            const dash = (seg.value / total) * c
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-acc}
              />
            )
            acc += dash
            return el
          })}
      </g>
      {centerTop != null && (
        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="central" className="donut-num" style={{ fill: centerColor || 'var(--ink)' }}>
          {centerTop}
        </text>
      )}
      {centerSub && (
        <text x="50%" y="61%" textAnchor="middle" dominantBaseline="central" className="donut-sub">
          {centerSub}
        </text>
      )}
    </svg>
  )
}
