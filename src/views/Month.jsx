import { useEffect, useState } from 'react'
import { getMonth, saveMonth, listBills, listAccounts } from '../db'
import { evaluate, targets, pct } from '../score'
import { monthKey, monthLabel, shiftMonth, eur } from '../util'
import Ring from '../Ring'

function sumBills(bills, bucket) {
  return bills.filter((b) => b.active && b.bucket === bucket).reduce((s, b) => s + b.amount, 0)
}
function sumContrib(accounts) {
  return accounts.filter((a) => a.group === 'invest').reduce((s, a) => s + (a.contribution || 0), 0)
}

export default function Month({ settings }) {
  const [month, setMonth] = useState(monthKey())
  const [bills, setBills] = useState([])
  const [accounts, setAccounts] = useState([])
  const [income, setIncome] = useState(String(settings.income))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([listBills(), listAccounts()]).then(([b, a]) => {
      setBills(b)
      setAccounts(a)
    })
  }, [])

  useEffect(() => {
    getMonth(month).then((m) => {
      setIncome(String(m ? m.income : settings.income))
      setSaved(false)
    })
  }, [month, settings.income])

  const num = (v) => parseFloat(String(v).replace(',', '.')) || 0
  const inc = num(income)
  const t = targets(inc, settings)

  const needs = sumBills(bills, 'needs')
  const wants = sumBills(bills, 'wants')
  const savings = sumContrib(accounts)

  const draft = { income: inc, needs, wants, savings }
  const hasData = needs > 0 || wants > 0 || savings > 0
  const e = inc > 0 && hasData ? evaluate(draft, settings) : null

  async function submit() {
    await saveMonth({ month, ...draft })
    setSaved(true)
  }

  const buckets = [
    { name: 'Vajadused', kind: 'needs', value: needs, target: t.needs, pctKey: 'pctNeeds' },
    { name: 'Soovid', kind: 'wants', value: wants, target: t.wants, pctKey: 'pctWants' },
    { name: 'Säästud', kind: 'savings', value: savings, target: t.savings, pctKey: 'pctSavings' },
  ]

  return (
    <>
      <div className="month-picker">
        <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Eelmine">‹</button>
        <span className="label">{monthLabel(month)}</span>
        <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Järgmine">›</button>
      </div>

      {e && (
        <div className="card ring-card">
          <Ring value={e.total} tone={e.rating.tone} label={e.rating.label} />
        </div>
      )}

      {!hasData && (
        <div className="card">
          <p className="empty">
            Lisa kõigepealt arved (vaade "Arved") ja investeeringud (vaade "Vara") —
            siis arvutab app 50/30/20 skoori.
          </p>
        </div>
      )}

      <div className="card">
        <h2>Sissetulek</h2>
        <input
          className="big-input"
          type="text"
          inputMode="decimal"
          value={income}
          onChange={(ev) => { setIncome(ev.target.value); setSaved(false) }}
        />
      </div>

      <div className="card">
        <h2>Kuu kulud</h2>
        {buckets.map((b) => {
          const filled = b.target > 0 ? Math.min(100, (b.value / b.target) * 100) : 0
          return (
            <div className="bucket" key={b.kind}>
              <div className="row">
                <span className="name">{b.name}</span>
                <span className="amount">{eur(b.value)}</span>
              </div>
              <div className="bucket-foot">
                <div className={`bar ${b.kind}`}><span style={{ width: `${filled}%` }} /></div>
                <span className="target">{pct(b.value, inc)}% / {settings[b.pctKey]}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn" onClick={submit}>
        {saved ? 'Salvestatud ✓' : 'Salvesta kuu'}
      </button>
    </>
  )
}
