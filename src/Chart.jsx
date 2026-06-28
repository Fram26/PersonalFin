// Kerge SVG joongraafik trendi jaoks. Andmed: [{ label, value }]

export function LineChart({ data, color = '#72393f', height = 140 }) {
  if (!data || data.length === 0) return null
  const w = 320
  const pad = 8
  const values = data.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const y = (v) => pad + (1 - (v - min) / range) * (height - pad * 2)
  const x = (i) => pad + i * stepX

  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')
  const area = `${pad},${height - pad} ${points} ${x(data.length - 1)},${height - pad}`

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="chart" preserveAspectRatio="none">
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.value)} r={data.length > 12 ? 0 : 3} fill={color} />
      ))}
    </svg>
  )
}

export function ChartLabels({ data }) {
  if (data.length < 2) return null
  const first = data[0].label
  const last = data[data.length - 1].label
  return (
    <div className="chart-labels">
      <span>{first}</span>
      <span>{last}</span>
    </div>
  )
}
