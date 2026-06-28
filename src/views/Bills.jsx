import { useEffect, useState } from 'react'
import { listBills, addBill, updateBill, deleteBill } from '../db'
import { eur } from '../util'
import Icon from '../Icon'

export default function Bills() {
  const [bills, setBills] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [bucket, setBucket] = useState('needs')

  async function refresh() {
    setBills(await listBills())
  }
  useEffect(() => { refresh() }, [])

  async function add() {
    const amt = parseFloat(amount.replace(',', '.'))
    if (!name.trim() || !amt) return
    await addBill({ name: name.trim(), amount: amt, bucket })
    setName('')
    setAmount('')
    refresh()
  }

  async function toggle(b) {
    await updateBill(b.id, { active: !b.active })
    refresh()
  }
  async function remove(id) {
    await deleteBill(id)
    refresh()
  }

  const groups = [
    { key: 'needs', title: 'Vajadused' },
    { key: 'wants', title: 'Soovid' },
  ]

  return (
    <>
      <div className="card">
        <h2>Lisa korduv arve</h2>
        <div className="field">
          <input placeholder="Nimi" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="add-row">
          <input
            placeholder="Summa €"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
            <option value="needs">Vajadus</option>
            <option value="wants">Soov</option>
          </select>
          <button className="btn-sm" onClick={add} aria-label="Lisa"><Icon name="plus" size={20} /></button>
        </div>
      </div>

      {groups.map((g) => {
        const list = bills.filter((b) => b.bucket === g.key)
        const total = list.filter((b) => b.active).reduce((s, b) => s + b.amount, 0)
        return (
          <div className="card" key={g.key}>
            <h2>{g.title} · {eur(total)}/kuus</h2>
            <ul className="hist">
              {list.length === 0 && <li className="sub">Arveid pole</li>}
              {list.map((b) => (
                <li key={b.id} className={b.active ? '' : 'off'}>
                  <button className="dot" onClick={() => toggle(b)} aria-label="Lülita">
                    {b.active ? '●' : '○'}
                  </button>
                  <div className="m" style={{ flex: 1 }}>{b.name}</div>
                  <span className="pts">{eur(b.amount)}</span>
                  <button className="del" onClick={() => remove(b.id)} aria-label="Kustuta">×</button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </>
  )
}
