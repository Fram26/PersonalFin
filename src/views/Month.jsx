import { useEffect, useState } from 'react'
import { getMonth, saveMonth, listBills, listAccounts, listExpenses, addExpense, deleteExpense } from '../db'
import { evaluate, targets, pct } from '../score'
import { monthBuckets } from '../compute'
import { monthKey, monthLabel, shiftMonth, money } from '../util'
import Donut from '../Donut'
import Icon from '../Icon'

const COLORS = { needs: '#2b3a36', wants: '#8aa6a0', savings: '#0fa882', rest: '#e3e6e1' }
const BUCKET_NAME = { needs: 'Vajadus', wants: 'Soov', savings: 'Sääst' }
const TONE = { good: '#0fa882', ok: '#3a6ea5', warn: '#ab7a2a', bad: '#bf4658' }

export default function Month({ settings, mask }) {
  const [month, setMonth] = useState(monthKey())
  const [bills, setBills] = useState([])
  const [accounts, setAccounts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState(String(settings.income))

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
  const rest = Math.max(0, inc - b.needs - b.wants - b.savings)
  const hasData = b.needs > 0 || b.wants > 0 || b.savings > 0
  const e = inc > 0 && hasData ? evaluate({ income: inc, ...b }, settings) : null

  function changeIncome(v) {
    setIncome(v)
    saveMonth({ month, income: num(v) })
  }

  async function addKulu() {
    if (!num(amount)) return
    await addExpense({ month, bucket, amount: num(amount), note: note.trim() })
    setAmount('')
    setNote('')
    setExpenses(await listExpenses(month))
  }

  async function removeKulu(id) {
    await deleteExpense(id)
    setExpenses(await listExpenses(month))
  }

  const segments = [
    { label: 'Vajadused', value: b.needs, color: COLORS.needs, target: settings.pctNeeds },
    { label: 'Soovid', value: b.wants, color: COLORS.wants, target: settings.pctWants },
    { label: 'Säästud', value: b.savings, color: COLORS.savings, target: settings.pctSavings },
    { label: 'Jääk', value: rest, color: COLORS.rest, target: null },
  ]

  return (
    <>
      <div className="month-picker">
        <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Eelmine">‹</button>
        <span className="label">{monthLabel(month)}</span>
        <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Järgmine">›</button>
      </div>

      <div className="card">
        <div className="donut-wrap">
          <Donut
            segments={segments}
            centerTop={e ? e.rating.label : null}
            centerColor={e ? TONE[e.rating.tone] : undefined}
          />
        </div>
        <div className="legend">
          {segments.map((s) => (
            <div className="leg-row" key={s.label}>
              <span className="leg-dot" style={{ background: s.color }} />
              <span className="leg-name">{s.label}</span>
              <span className="leg-amt">{money(s.value, mask)}</span>
              <span className="leg-pct">
                {pct(s.value, inc)}%{s.target != null && ` / ${s.target}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Sissetulek</h2>
        {mask ? (
          <div className="big-input masked">••••</div>
        ) : (
          <input
            className="big-input"
            type="text"
            inputMode="decimal"
            value={income}
            onChange={(ev) => changeIncome(ev.target.value)}
          />
        )}
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
                <span className={`tag tag-${x.bucket}`}>{BUCKET_NAME[x.bucket]}</span>
                <div style={{ flex: 1 }}>
                  <div className="m">{money(x.amount, mask)}</div>
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
