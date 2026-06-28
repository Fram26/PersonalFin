import Dexie from 'dexie'
import { SEED_BILLS, SEED_ACCOUNTS } from './seed'

export const db = new Dexie('personalfin')

db.version(1).stores({
  settings: 'key',
  months: 'month',
})

db.version(2).stores({
  settings: 'key',
  months: 'month',
  bills: '++id, bucket',
  accounts: '++id, group',
  snapshots: '[accountId+month], accountId, month',
})

export const DEFAULT_SETTINGS = {
  key: 'main',
  income: 0,
  pctNeeds: 50,
  pctWants: 30,
  pctSavings: 20,
  notify: false,
  seeded: false,
}

export async function resetAll() {
  await Promise.all([
    db.bills.clear(),
    db.accounts.clear(),
    db.snapshots.clear(),
    db.months.clear(),
  ])
  const fresh = { ...DEFAULT_SETTINGS, seeded: true }
  await db.settings.put(fresh)
  return fresh
}

export async function getSettings() {
  let s = await db.settings.get('main')
  if (!s) {
    s = { ...DEFAULT_SETTINGS }
    await db.settings.put(s)
  }
  if (!s.seeded) {
    await seedData()
    s = await db.settings.get('main')
  }
  return s
}

async function seedData() {
  const billCount = await db.bills.count()
  if (billCount === 0) await db.bills.bulkAdd(SEED_BILLS)
  const accCount = await db.accounts.count()
  if (accCount === 0) await db.accounts.bulkAdd(SEED_ACCOUNTS)
  await db.settings.update('main', { seeded: true })
}

export async function saveSettings(patch) {
  const current = await getSettings()
  const next = { ...current, ...patch, key: 'main' }
  await db.settings.put(next)
  return next
}

// --- months ---
export async function saveMonth(entry) {
  await db.months.put({ ...entry, updatedAt: Date.now() })
}
export function getMonth(month) {
  return db.months.get(month)
}
export function listMonths() {
  return db.months.orderBy('month').reverse().toArray()
}

// --- bills ---
export function listBills() {
  return db.bills.toArray()
}
export function addBill(bill) {
  return db.bills.add({ active: true, ...bill })
}
export function updateBill(id, patch) {
  return db.bills.update(id, patch)
}
export function deleteBill(id) {
  return db.bills.delete(id)
}

// --- accounts ---
export function listAccounts() {
  return db.accounts.toArray()
}
export function addAccount(acc) {
  return db.accounts.add(acc)
}
export function updateAccount(id, patch) {
  return db.accounts.update(id, patch)
}
export async function deleteAccount(id) {
  await db.accounts.delete(id)
  await db.snapshots.where('accountId').equals(id).delete()
}

// --- snapshots (one value per account+month) ---
export function setSnapshot(accountId, month, value) {
  return db.snapshots.put({ accountId, month, value })
}
export function getSnapshot(accountId, month) {
  return db.snapshots.get([accountId, month])
}
export function snapshotsForMonth(month) {
  return db.snapshots.where('month').equals(month).toArray()
}
export function allSnapshots() {
  return db.snapshots.toArray()
}
