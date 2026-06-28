import { useEffect, useState } from 'react'
import { listMonths } from '../db'
import { evaluate, pct } from '../score'
import { monthLabel, eur } from '../util'
import { LineChart, ChartLabels } from '../Chart'

export default function History({ settings }) {
  const [months, setMonths] = useState([])

  useEffect(() => {
    listMonths().then(setMonths)
  }, [])

  if (months.length === 0) {
    return (
      <div className="card">
        <p className="empty">Ajalugu on tühi. Sisesta esimene kuu vaates "Kuu".</p>
      </div>
    )
  }

  const evals = months.map((m) => ({ m, e: evaluate(m, settings) }))
  const avg = Math.round(evals.reduce((s, x) => s + x.e.total, 0) / evals.length)
  const avgSavings = Math.round(months.reduce((s, m) => s + pct(m.savings, m.income), 0) / months.length)

  const chron = [...evals].reverse()
  const scoreData = chron.map((x) => ({ label: monthLabel(x.m.month).split(' ')[0].slice(0, 3), value: x.e.total }))

  return (
    <>
      <div className="card stat-card">
        <div className="stat">
          <span className="stat-label">Keskmine skoor</span>
          <span className="stat-num">{avg}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Keskmine säästumäär</span>
          <span className="stat-num">{avgSavings}%</span>
        </div>
      </div>

      {scoreData.length >= 2 && (
        <div className="card">
          <h2>Skoori trend</h2>
          <LineChart data={scoreData} color="#1f7a5e" />
          <ChartLabels data={scoreData} />
        </div>
      )}

      <div className="card">
        <h2>Kuud</h2>
        <ul className="hist">
          {evals.map(({ m, e }) => (
            <li key={m.month}>
              <div style={{ flex: 1 }}>
                <div className="m">{monthLabel(m.month)}</div>
                <div className="sub">
                  {pct(m.needs, m.income)} / {pct(m.wants, m.income)} / {pct(m.savings, m.income)} ·
                  {' '}säästsid {eur(m.savings)}
                </div>
              </div>
              <span className={`badge tone-${e.rating.tone}`}>{e.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
