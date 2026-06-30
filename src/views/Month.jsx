import { useEffect, useState } from 'react'
import { getMonth, saveMonth, listBills, listAccounts, listExpenses, addExpense, deleteExpense } from '../db'
import { evaluate, targets, pct } from '../score'
import { monthBuckets, billsSum, contribSum } from '../compute'
import { monthKey, monthLabel, shiftMonth, eur } from '../util'
import Ring from '../Ring'
import Icon from '../Icon'

const BUCKETS = [
  { key: 'needs', name: 'Vajadused', pctKey: 'pctNeeds' },
  { key: 'wants', name: 'Soovid', pctKey: 'pctWants' },
  { key: 'savings', name: 'Säästud', pctKey: 'pctSavings' },
]

export default function Month({ settings }) {
  const [month, setMonth] = useState(monthKey())
  const [bills, setBills] = useState([])
  const [accounts, setAccounts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState(String(settings.income))

  // kulu vorm
  const [amount, setAmount] = useState('')
  const [bucket, setBucket] = useState('needs')
  const [note, setNote] = useState('')

  useEffect(() => {
    Promise.all([listBills(), listAccounts()]).then(([b, a]) => {
      setBills(b)
      setAccounts(a)
    })
  }, [])

  useEffect(() => {
    Promise.all([getMonth(month), listExpenses(month)]).then(([m, ex]) => {
      setIncome(String(m ? m.income : settings.income))
      setExpenses(ex)
    })
  }, [month, settings.income])

  const num = (v) => parseFloat(String(v).replace(',', '.')) || 0
  const inc = num(income)
  const t = targets(inc, settings)
  const b = monthBuckets(bills, accounts, expenses)
  const hasData = b.needs > 0 || b.wants > 0 || b.savings > 0
  const e = inc > 0 && hasData ? evaluate({ income: inc, ...b }, settings) : null

  function changeIncome(v) {
    setIncome(v)
    saveMonth({ month, income: num(v) })
  }

  async function addKulu() {
    const val = num(amount)
    if (!val) return
    await addExpense({ month, bucket, amount: val, note: note.trim() })
    setAmount('')
    setNote('')
    setExpenses(await listExpenses(month))
  }

  async function removeKulu(id) {
    await deleteExpense(id)
    setExpenses(await listExpenses(month))
  }

  // jooksvad kulud ämbri kaupa (näitamiseks)
  const running = (k) => expenses.filter((x) => x.bucket === k).reduce((s, x) => s + x.amount, 0)
  const fixed = { needs: billsSum(bills, 'needs'), wants: billsSum(bills, 'wants'), savings: contribSum(accounts) }

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

      <div className="card">
        <h2>Sissetulek</h2>
        <input
          className="big-input"
          type="text"
          inputMode="decimal"
          value={income}
          onChange={(ev) => changeIncome(ev.target.value)}
        />
      </div>

      <div className="card">
        <h2>50/30/20</h2>
        {BUCKETS.map((bk) => {
          const value = b[bk.key]
          const target = t[bk.key]
          const filled = target > 0 ? Math.min(100, (value / target) * 100) : 0
          return (
            <div className="bucket" key={bk.key}>
              <div className="row">
                <span className="name">{bk.name}</span>
                <span className="amount">{eur(value)}</span>
              </div>
              <div className="bucket-foot">
                <div className={`bar ${bk.key}`}><span style={{ width: `${filled}%` }} /></div>
                <span className="target">{pct(value, inc)}% / {settings[bk.pctKey]}%</span>
              </div>
              <div className="sub bucket-split">
                {bk.key === 'savings' ? 'panused' : 'arved'} {eur(fixed[bk.key])} · jooksvad {eur(running(bk.key))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h2>Lisa kulu</h2>
        <div className="add-row">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Summa €"
            value={amount}
            onChange={(ev) => setAmount(ev.target.value)}
          />
          <select value={bucket} onChange={(ev) => setBucket(ev.target.value)}>
            <option value="needs">Vajadus</option>
            <option value="wants">Soov</option>
            <option value="savings">Sääst</option>
          </select>
          <button className="btn-sm" onClick={addKulu} aria-label="Lisa"><Icon name="plus" size={20} /></button>
        </div>
        <div className="field" style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            placeholder="Märkus (nt pood, restoran)"
            value={note}
            onChange={(ev) => setNote(ev.target.value)}
          />
        </div>

        {expenses.length > 0 && (
          <ul className="hist" style={{ marginTop: '0.5rem' }}>
            {expenses.map((x) => (
              <li key={x.id}>
                <span className={`tag tag-${x.bucket}`}>{BUCKETS.find((k) => k.key === x.bucket).name}</span>
                <div style={{ flex: 1 }}>
                  <div className="m">{eur(x.amount)}</div>
                  {x.note && <div className="sub">{x.note}</div>}
                </div>
                <button className="del" onClick={() => removeKulu(x.id)} aria-label="Kustuta">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
