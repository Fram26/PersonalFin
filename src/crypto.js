// AES-GCM krüpteerimine, võti tuletatud paroolist (PBKDF2). Vajab secure context (https/localhost).

const enc = new TextEncoder()
const dec = new TextDecoder()

export function hasCrypto() {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

export function randomBytes(n) {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return a
}

export function toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}
export function fromB64(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

export async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptJSON(key, obj) {
  const iv = randomBytes(12)
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)))
  return `${toB64(iv)}.${toB64(ct)}`
}

export async function decryptJSON(key, payload) {
  const [ivb, ctb] = payload.split('.')
  const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(ivb) }, key, fromB64(ctb))
  return JSON.parse(dec.decode(data))
}
