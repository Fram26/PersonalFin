const MONTHS = [
  'jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni',
  'juuli', 'august', 'september', 'oktoober', 'november', 'detsember',
]

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthKey(d)
}

export function eur(n) {
  return (n || 0).toLocaleString('et-EE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
}

export function money(n, mask) {
  return mask ? '••••' : eur(n)
}
