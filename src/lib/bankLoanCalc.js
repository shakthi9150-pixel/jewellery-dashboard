// Computes when the next interest payment is due, based on the last payment
// (or loan start date if no payments yet) plus the interest cycle.
export function nextDueDate(loanDate, interestCycleMonths, lastPaymentDate) {
  const base = new Date(lastPaymentDate || loanDate)
  const due = new Date(base)
  due.setMonth(due.getMonth() + interestCycleMonths)
  return due
}

export function daysUntil(dateObj, today = new Date()) {
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const b = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

// Simple annualized interest estimate for the current cycle (for display only)
export function estimateInterestDue(loanAmount, annualRatePercent, cycleMonths) {
  const amount = (loanAmount * annualRatePercent * (cycleMonths / 12)) / 100
  return Math.round(amount * 100) / 100
}

// Converts a monthly or annual rate into an annual-equivalent rate
export function toAnnualRate(rate, unit) {
  return unit === 'monthly' ? rate * 12 : rate
}
