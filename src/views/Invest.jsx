import { useEffect, useMemo, useState } from 'react'
import { listAccounts, allSnapshots, setSnapshot, addAccount, deleteAccount } from '../db'
import { monthKey, monthLabel, shiftMonth, eur, money } from '../util'
import { LineChart, ChartLabels } from '../Chart'
import Icon from '../Icon'

const GROUPS = [
  { key: 'invest', title: 'Investeeringud' },
  { key: 'property', title: 'Kinnisvara / vara' },
  { key: 'loan', title: 'Laenud' },
]

function lastValueBefore(snaps, accountId, month, defaultValue) {
  const prior = snaps
    .filter((s) => s.accountId === accountId && s.month <= month)
    .sort((a, b) => b.month.localeCompare(a.month))
  return prior.length ? prior[0].value : defaultValue
}

export default function Invest({ mask }) {
  const [month, setMonth] = useState(monthKey())
  const [accounts, setAccounts] = useState([])
  const [snaps, setSnaps] = useState([])
  const [draft, setDraft] = useState({})
  const [saved, setSaved] = useState(false)

  async function load() {
    const [a, s] = await Promise.all([listAccounts(), allSnapshots()])
    setAccounts(a)
    setSnaps(s)
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (accounts.length === 0) return
    const d = {}
    for (const a of accounts) {
      const snap = snaps.find((s) => s.accountId === a.id && s.month === month)
      d[a.id] = String(snap ? snap.value : lastValueBefore(snaps, a.id, month, a.defaultValue || 0))
    }
    setDraft(d)
    setSaved(false)
  }, [month, accounts, snaps])

  const num = (v) => parseFloat(String(v).replace(',', '.')) || 0

  function sumGroup(group) {
    return accounts.filter((a) => a.group === group).reduce((s, a) => s + num(draft[a.id]), 0)
  }
  const investTotal = sumGroup('invest')
  const netWorth = sumGroup('invest') + sumGroup('property') - sumGroup('loan')
  const monthlyContrib = accounts
    .filter((a) => a.group === 'invest')
    .reduce((s, a) => s + (a.contribution || 0), 0)

  // trend: kõik kuud millel snapshot olemas
  const series = useMemo(() => {
    const months = [...new Set(snaps.map((s) => s.month))].sort()
    return months.map((m) => {
      let inv = 0, prop = 0, loan = 0
      for (const a of accounts) {
        const v = lastValueBefore(snaps, a.id, m, null)
        if (v == null) continue
        if (a.group === 'invest') inv += v
        else if (a.group === 'property') prop += v
        else if (a.group === 'loan') loan += v
      }
      return { label: monthLabel(m).split(' ')[0].slice(0, 3), month: m, invest: inv, net: inv + prop - loan }
    })
  }, [snaps, accounts])

  async function save() {
    await Promise.all(accounts.map((a) => setSnapshot(a.id, month, num(draft[a.id]))))
    await load()
    setSaved(true)
  }

  const netData = series.map((s) => ({ label: s.label, value: s.net }))
  const invData = series.map((s) => ({ label: s.label, value: s.invest }))

  return (
    <>
      <div className="card stat-card">
        <div className="stat">
          <span className="stat-label">Netovara</span>
          <span className="stat-num">{money(netWorth, mask)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Investeeringud</span>
          <span className="stat-num">{money(investTotal, mask)}</span>
        </div>
      </div>

      {series.length >= 2 && (
        <>
          <div className="card">
            <h2>Netovara trend</h2>
            <LineChart data={netData} color="#2b3a36" />
            <ChartLabels data={netData} />
          </div>
          <div className="card">
            <h2>Investeeringud trend</h2>
            <LineChart data={invData} color="#0fa882" />
            <ChartLabels data={invData} />
            <p className="sub" style={{ marginTop: '0.5rem' }}>
              Igakuine panus: <strong>{money(monthlyContrib, mask)}</strong>
            </p>
          </div>
        </>
      )}

      <div className="month-picker">
        <button onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <span className="label">{monthLabel(month)}</span>
        <button onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
      </div>

      {GROUPS.map((g) => {
        const list = accounts.filter((a) => a.group === g.key)
        if (list.length === 0) return null
        return (
          <div className="card" key={g.key}>
            <h2>{g.title} · {money(sumGroup(g.key), mask)}</h2>
            {list.map((a) => (
              <div className="acc-row" key={a.id}>
                <div className="acc-name">
                  {a.name}
                  {a.contribution > 0 && <span className="sub"> +{money(a.contribution, mask)}/k</span>}
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={draft[a.id] ?? ''}
                  onChange={(e) => { setDraft({ ...draft, [a.id]: e.target.value }); setSaved(false) }}
                />
              </div>
            ))}
          </div>
        )
      })}

      <button className="btn" onClick={save}>
        {saved ? 'Salvestatud ✓' : `Salvesta ${monthLabel(month)}`}
      </button>

      <ManageAccounts onChange={load} accounts={accounts} />
    </>
  )
}

function ManageAccounts({ onChange, accounts }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [group, setGroup] = useState('invest')
  const [contribution, setContribution] = useState('')

  async function add() {
    if (!name.trim()) return
    await addAccount({
      name: name.trim(),
      group,
      contribution: parseFloat(contribution.replace(',', '.')) || 0,
      defaultValue: 0,
    })
    setName('')
    setContribution('')
    onChange()
  }

  async function remove(id) {
    await deleteAccount(id)
    onChange()
  }

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <button className="manage-toggle" onClick={() => setOpen(!open)}>
        Halda kontosid {open ? '▾' : '▸'}
      </button>
      {open && (
        <>
          <div className="field" style={{ marginTop: '0.75rem' }}>
            <input placeholder="Konto nimi" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="add-row">
            <input
              placeholder="Panus €/k"
              inputMode="decimal"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="invest">Investeering</option>
              <option value="property">Vara</option>
              <option value="loan">Laen</option>
            </select>
            <button className="btn-sm" onClick={add} aria-label="Lisa"><Icon name="plus" size={20} /></button>
          </div>
          <ul className="hist" style={{ marginTop: '0.75rem' }}>
            {accounts.map((a) => (
              <li key={a.id}>
                <span className="m" style={{ flex: 1 }}>{a.name}</span>
                <span className="sub">{a.group}</span>
                <button className="del" onClick={() => remove(a.id)} aria-label="Kustuta">×</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
