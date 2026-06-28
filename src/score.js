// 50/30/20 kursihinnang

export function targets(income, s) {
  return {
    needs: (income * s.pctNeeds) / 100,
    wants: (income * s.pctWants) / 100,
    savings: (income * s.pctSavings) / 100,
  }
}

function underScore(actual, target) {
  // hea kui actual <= target (vajadused, soovid)
  if (target <= 0) return 100
  const over = Math.max(0, actual - target) / target
  return Math.max(0, Math.round(100 - over * 100))
}

function overScore(actual, target) {
  // hea kui actual >= target (säästud)
  if (target <= 0) return 100
  const under = Math.max(0, target - actual) / target
  return Math.max(0, Math.round(100 - under * 100))
}

export function evaluate(month, settings) {
  const t = targets(month.income, settings)
  const scores = {
    needs: underScore(month.needs, t.needs),
    wants: underScore(month.wants, t.wants),
    savings: overScore(month.savings, t.savings),
  }
  const total = Math.round((scores.needs + scores.wants + scores.savings) / 3)
  return { targets: t, scores, total, rating: rate(total) }
}

export function rate(total) {
  if (total >= 85) return { label: 'Suurepärane', tone: 'good' }
  if (total >= 65) return { label: 'Hea', tone: 'ok' }
  if (total >= 45) return { label: 'Okei', tone: 'warn' }
  return { label: 'Üle eelarve', tone: 'bad' }
}

export function pct(amount, income) {
  if (!income) return 0
  return Math.round((amount / income) * 100)
}
