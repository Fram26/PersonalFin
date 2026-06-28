import { useEffect, useState } from 'react'
import { getSettings } from './db'
import Month from './views/Month'
import Bills from './views/Bills'
import Invest from './views/Invest'
import History from './views/History'
import Settings from './views/Settings'
import Icon from './Icon'
import './App.css'

const TABS = [
  { id: 'month', ic: 'month', label: 'Kuu' },
  { id: 'bills', ic: 'bills', label: 'Arved' },
  { id: 'invest', ic: 'invest', label: 'Vara' },
  { id: 'history', ic: 'history', label: 'Ajalugu' },
]

export default function App() {
  const [view, setView] = useState('month')
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  if (!settings) return null

  return (
    <div className="app">
      <div className="topbar">
        <h1>PersonalFin</h1>
        <button className="gear" onClick={() => setView('settings')} aria-label="Seaded">
          <Icon name="settings" size={22} />
        </button>
      </div>

      {view === 'month' && <Month settings={settings} />}
      {view === 'bills' && <Bills />}
      {view === 'invest' && <Invest />}
      {view === 'history' && <History settings={settings} />}
      {view === 'settings' && (
        <Settings settings={settings} onSave={setSettings} onClose={() => setView('month')} />
      )}

      <nav className="nav">
        {TABS.map((t) => (
          <button key={t.id} className={view === t.id ? 'active' : ''} onClick={() => setView(t.id)}>
            <span className="ic"><Icon name={t.ic} size={21} /></span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
