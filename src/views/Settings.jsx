import { useState } from 'react'
import { saveSettings, resetAll } from '../db'

export default function Settings({ settings, onSave, onClose, onLock }) {
  const [income, setIncome] = useState(String(settings.income))
  const [pn, setPn] = useState(String(settings.pctNeeds))
  const [pw, setPw] = useState(String(settings.pctWants))
  const [ps, setPs] = useState(String(settings.pctSavings))
  const [notify, setNotify] = useState(settings.notify)
  const [notifyDay, setNotifyDay] = useState(String(settings.notifyDay))

  const sum = (parseInt(pn) || 0) + (parseInt(pw) || 0) + (parseInt(ps) || 0)

  async function requestNotify() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotify(perm === 'granted')
  }

  const [confirmReset, setConfirmReset] = useState(false)

  async function reset() {
    const fresh = await resetAll()
    onSave(fresh)
    onClose()
  }

  async function save() {
    const next = await saveSettings({
      income: parseFloat(income.replace(',', '.')) || 0,
      pctNeeds: parseInt(pn) || 0,
      pctWants: parseInt(pw) || 0,
      pctSavings: parseInt(ps) || 0,
      notify,
      notifyDay: Math.min(28, Math.max(1, parseInt(notifyDay) || 28)),
    })
    onSave(next)
    onClose()
  }

  return (
    <>
      <div className="card">
        <h2>Seaded</h2>
        <div className="field">
          <label>Neto sissetulek (vaikimisi)</label>
          <input type="text" inputMode="decimal" value={income} onChange={(e) => setIncome(e.target.value)} />
        </div>
        <div className="field">
          <label>Sihtprotsendid (vajadused / soovid / säästud)</label>
          <div className="pct-row">
            <input type="text" inputMode="numeric" value={pn} onChange={(e) => setPn(e.target.value)} />
            <input type="text" inputMode="numeric" value={pw} onChange={(e) => setPw(e.target.value)} />
            <input type="text" inputMode="numeric" value={ps} onChange={(e) => setPs(e.target.value)} />
          </div>
          {sum !== 100 && <div className="pct-warn">Kokku {sum}% — peaks olema 100%</div>}
        </div>
        <div className="toggle">
          <div>
            <div>Igakuine meeldetuletus</div>
            <div className="sub">Teavitus kui kuu andmed sisestamata</div>
          </div>
          <button className="btn ghost auto" onClick={requestNotify}>
            {notify ? 'Lubatud ✓' : 'Luba'}
          </button>
        </div>
        <div className="field" style={{ marginTop: '0.9rem' }}>
          <label>Meeldetuletuse päev (kuu päev 1–28)</label>
          <input type="text" inputMode="numeric" value={notifyDay} onChange={(e) => setNotifyDay(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <h2>Andmed</h2>
        {!confirmReset ? (
          <button className="btn ghost danger" onClick={() => setConfirmReset(true)}>
            Tühjenda kõik andmed
          </button>
        ) : (
          <>
            <p className="sub">Kustutab kõik arved, kontod, kuud ja ajaloo. Ei saa tagasi võtta.</p>
            <button className="btn danger-solid" onClick={reset}>Jah, tühjenda</button>
            <button className="btn ghost mt" onClick={() => setConfirmReset(false)}>Loobu</button>
          </>
        )}
      </div>

      <button className="btn" onClick={save}>Salvesta</button>
      <button className="btn ghost mt" onClick={onLock}>Lukusta app</button>
      <button className="btn ghost mt" onClick={onClose}>Tagasi</button>
    </>
  )
}
