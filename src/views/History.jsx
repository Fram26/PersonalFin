import { useEffect, useState } from 'react'
import { listMonths, listBills, listAccounts, allExpenses } from '../db'
import { evaluate, pct } from '../score'
import { monthBuckets } from '../compute'
import { monthLabel, money } from '../util'
import { LineChart, ChartLabels } from '../Chart'

export default function History({ settings, mask }) {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    Promise.all([listMonths(), listBills(), listAccounts(), allExpenses()]).then(
      ([months, bills, accounts, expenses]) => {
        const data = months.map((m) => {
          const ex = expenses.filter((e) => e.month === m.month)
          const buckets = monthBuckets(bills, accounts, ex)
          const monthData = { income: m.income, ...buckets }
          return { month: m.month, ...monthData, e: evaluate(monthData, settings) }
        })
        setRows(data)
      }
    )
  }, [settings])

  if (!rows) return null
  if (rows.length === 0) {
    return (
      <div className="card">
        <p className="empty">Ajalugu on tühi. Sisesta esimene kuu vaates "Kuu".</p>
      </div>
    )
  }

  const avg = Math.round(rows.reduce((s, x) => s + x.e.total, 0) / rows.length)
  const avgSavings = Math.round(rows.reduce((s, x) => s + pct(x.savings, x.income), 0) / rows.length)

  const chron = [...rows].reverse()
  const scoreData = chron.map((x) => ({ label: monthLabel(x.month).split(' ')[0].slice(0, 3), value: x.e.total }))

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
          <LineChart data={scoreData} color="#0fa882" />
          <ChartLabels data={scoreData} />
        </div>
      )}

      <div className="card">
        <h2>Kuud</h2>
        <ul className="hist">
          {rows.map((x) => (
            <li key={x.month}>
              <div style={{ flex: 1 }}>
                <div className="m">{monthLabel(x.month)}</div>
                <div className="sub">
                  {pct(x.needs, x.income)} / {pct(x.wants, x.income)} / {pct(x.savings, x.income)} ·
                  {' '}säästsid {money(x.savings, mask)}
                </div>
              </div>
              <span className={`badge tone-${x.e.rating.tone}`}>{x.e.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
