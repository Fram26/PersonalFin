import { deriveKey, encryptJSON, decryptJSON, randomBytes, toB64, fromB64 } from './crypto'

const SALT_KEY = 'pf_salt'
const VAULT_KEY = 'pf_vault'

export const DEFAULT_SETTINGS = {
  income: 0,
  pctNeeds: 50,
  pctWants: 30,
  pctSavings: 20,
  notify: false,
  notifyDay: 28,
  lastNotified: '',
}

let key = null
let vault = null

function emptyVault() {
  return { settings: { ...DEFAULT_SETTINGS }, months: [], bills: [], accounts: [], snapshots: [], expenses: [], seq: 1 }
}

export function hasVault() {
  return !!localStorage.getItem(VAULT_KEY)
}
export function isUnlocked() {
  return !!vault
}

async function persist() {
  localStorage.setItem(VAULT_KEY, await encryptJSON(key, vault))
}

export async function setupPassword(password) {
  // eemalda vana krüpteerimata andmebaas
  try {
    indexedDB.deleteDatabase('personalfin')
  } catch {
    // ignore
  }
  const salt = randomBytes(16)
  localStorage.setItem(SALT_KEY, toB64(salt))
  key = await deriveKey(password, salt)
  vault = emptyVault()
  await persist()
}

export async function unlock(password) {
  const sb = localStorage.getItem(SALT_KEY)
  if (!sb) throw new Error('no-vault')
  key = await deriveKey(password, fromB64(sb))
  const decoded = await decryptJSON(key, localStorage.getItem(VAULT_KEY)) // viskab kui vale parool
  vault = {
    ...emptyVault(),
    ...decoded,
    settings: { ...DEFAULT_SETTINGS, ...(decoded.settings || {}) },
  }
}

export function lock() {
  key = null
  vault = null
}

// Lähtestamine kui parool unustatud: kustutab krüpteeritud andmed jäädavalt.
export function wipe() {
  localStorage.removeItem(VAULT_KEY)
  localStorage.removeItem(SALT_KEY)
  try {
    indexedDB.deleteDatabase('personalfin')
  } catch {
    // ignore
  }
  key = null
  vault = null
}

export async function changePassword(oldPassword, newPassword) {
  const sb = localStorage.getItem(SALT_KEY)
  const oldKey = await deriveKey(oldPassword, fromB64(sb))
  await decryptJSON(oldKey, localStorage.getItem(VAULT_KEY)) // viskab kui vana parool vale
  const salt = randomBytes(16)
  localStorage.setItem(SALT_KEY, toB64(salt))
  key = await deriveKey(newPassword, salt)
  await persist() // re-krüpteerib praeguse vault'i uue võtmega
}

// --- settings ---
export async function getSettings() {
  return vault.settings
}
export async function saveSettings(patch) {
  vault.settings = { ...vault.settings, ...patch }
  await persist()
  return vault.settings
}

// --- months ---
export async function saveMonth(entry) {
  const i = vault.months.findIndex((m) => m.month === entry.month)
  const rec = { ...entry, updatedAt: Date.now() }
  if (i >= 0) vault.months[i] = rec
  else vault.months.push(rec)
  await persist()
}
export async function getMonth(month) {
  return vault.months.find((m) => m.month === month)
}
export async function listMonths() {
  return [...vault.months].sort((a, b) => b.month.localeCompare(a.month))
}

// --- bills ---
export async function listBills() {
  return [...vault.bills]
}
export async function addBill(bill) {
  const rec = { id: vault.seq++, active: true, ...bill }
  vault.bills.push(rec)
  await persist()
  return rec.id
}
export async function updateBill(id, patch) {
  const b = vault.bills.find((x) => x.id === id)
  if (b) Object.assign(b, patch)
  await persist()
}
export async function deleteBill(id) {
  vault.bills = vault.bills.filter((b) => b.id !== id)
  await persist()
}

// --- accounts ---
export async function listAccounts() {
  return [...vault.accounts]
}
export async function addAccount(acc) {
  const rec = { id: vault.seq++, ...acc }
  vault.accounts.push(rec)
  await persist()
  return rec.id
}
export async function updateAccount(id, patch) {
  const a = vault.accounts.find((x) => x.id === id)
  if (a) Object.assign(a, patch)
  await persist()
}
export async function deleteAccount(id) {
  vault.accounts = vault.accounts.filter((a) => a.id !== id)
  vault.snapshots = vault.snapshots.filter((s) => s.accountId !== id)
  await persist()
}

// --- snapshots (üks väärtus konto+kuu kohta) ---
export async function setSnapshot(accountId, month, value) {
  const s = vault.snapshots.find((x) => x.accountId === accountId && x.month === month)
  if (s) s.value = value
  else vault.snapshots.push({ accountId, month, value })
  await persist()
}
export async function getSnapshot(accountId, month) {
  return vault.snapshots.find((s) => s.accountId === accountId && s.month === month)
}
export async function snapshotsForMonth(month) {
  return vault.snapshots.filter((s) => s.month === month)
}
export async function allSnapshots() {
  return [...vault.snapshots]
}

// --- expenses (jooksvad kulud kuu kaupa) ---
export async function listExpenses(month) {
  return vault.expenses.filter((e) => e.month === month)
}
export async function allExpenses() {
  return [...vault.expenses]
}
export async function addExpense(exp) {
  const rec = { id: vault.seq++, ...exp }
  vault.expenses.push(rec)
  await persist()
  return rec.id
}
export async function deleteExpense(id) {
  vault.expenses = vault.expenses.filter((e) => e.id !== id)
  await persist()
}

// --- reset ---
export async function resetAll() {
  vault = emptyVault()
  await persist()
  return vault.settings
}
