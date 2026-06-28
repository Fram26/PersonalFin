import { monthKey, monthLabel } from './util'

// Kuu, mille andmed on sisestamata ja meeldetuletuse päev käes; muidu null.
export function dueMonth(settings, savedKeys) {
  const today = new Date()
  if (today.getDate() < (settings.notifyDay || 28)) return null
  const cur = monthKey(today)
  return savedKeys.includes(cur) ? null : cur
}

export async function fireNotification(month) {
  const title = 'PersonalFin'
  const body = `Sisesta ${monthLabel(month)} andmed — vaata kas pidasid 50/30/20 kurssi`
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.ready)
    if (reg && reg.showNotification) {
      await reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: 'monthly' })
      return
    }
  } catch {
    // ignore
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}
