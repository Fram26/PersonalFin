import { useState } from 'react'
import { hasVault, setupPassword, unlock, wipe } from './db'
import { hasCrypto } from './crypto'

export default function Lock({ onUnlocked }) {
  const [setup, setSetup] = useState(!hasVault())
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [taps, setTaps] = useState(0)
  const showForgot = taps >= 5

  if (!hasCrypto()) {
    return (
      <div className="lock">
        <div className="lock-card">
          <h1>PersonalFin</h1>
          <p className="sub">
            Krüpteerimine vajab turvalist ühendust (HTTPS). Ava app HTTPS-aadressilt või
            arvutis aadressilt <strong>http://localhost:5173</strong>.
          </p>
        </div>
      </div>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (setup) {
      if (pw.length < 4) return setErr('Parool peab olema vähemalt 4 märki')
      if (pw !== pw2) return setErr('Paroolid ei kattu')
      setBusy(true)
      await setupPassword(pw)
      onUnlocked()
    } else {
      setBusy(true)
      try {
        await unlock(pw)
        onUnlocked()
      } catch {
        setErr('Vale parool')
        setBusy(false)
      }
    }
  }

  function reset() {
    wipe()
    setSetup(true)
    setConfirmReset(false)
    setPw('')
    setPw2('')
    setErr('')
  }

  return (
    <div className="lock">
      <form className="lock-card" onSubmit={submit}>
        <h1 onClick={() => setTaps((t) => t + 1)}>PersonalFin</h1>
        <p className="sub">{setup ? 'Loo parool oma andmete kaitseks' : 'Sisesta parool'}</p>

        <input
          type="password"
          placeholder="Parool"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        {setup && (
          <input
            type="password"
            placeholder="Korda parooli"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        )}

        {err && <div className="pct-warn">{err}</div>}
        {setup && (
          <p className="sub lock-warn">
            Parool krüpteerib kõik andmed selles seadmes. Parooli unustamisel pole andmeid
            võimalik taastada.
          </p>
        )}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? '...' : setup ? 'Loo parool' : 'Ava'}
        </button>
      </form>

      {!setup && showForgot && (
        <div className="lock-forgot">
          {!confirmReset ? (
            <button type="button" className="link-btn" onClick={() => setConfirmReset(true)}>
              Unustasid parooli?
            </button>
          ) : (
            <div className="lock-card lock-reset">
              <p className="sub">
                Lähtestamine kustutab kõik andmed selles seadmes jäädavalt ja saad seada uue
                parooli. Andmeid ei saa tagasi.
              </p>
              <button type="button" className="btn danger-solid" onClick={reset}>
                Lähtesta ja kustuta andmed
              </button>
              <button type="button" className="btn ghost mt" onClick={() => setConfirmReset(false)}>
                Loobu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
