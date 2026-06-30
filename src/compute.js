// Ühe kuu ämbrite tegelikud summad: püsiarved + jooksvad kulud (+ säästupanused).

export function billsSum(bills, bucket) {
  return bills.filter((b) => b.active && b.bucket === bucket).reduce((s, b) => s + b.amount, 0)
}

export function contribSum(accounts) {
  return accounts.filter((a) => a.group === 'invest').reduce((s, a) => s + (a.contribution || 0), 0)
}

function expSum(expenses, bucket) {
  return expenses.filter((e) => e.bucket === bucket).reduce((s, e) => s + e.amount, 0)
}

// expenses = ainult selle kuu kulud
export function monthBuckets(bills, accounts, expenses) {
  return {
    needs: billsSum(bills, 'needs') + expSum(expenses, 'needs'),
    wants: billsSum(bills, 'wants') + expSum(expenses, 'wants'),
    savings: contribSum(accounts) + expSum(expenses, 'savings'),
  }
}
