// Simple interest calculation for pawn loans.
// Pawn broker convention: any part of a month counts as a full month.
export function monthsElapsed(pledgeDate, asOfDate = new Date()) {
  const start = new Date(pledgeDate)
  const end = new Date(asOfDate)
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() >= start.getDate()) {
    months += 1 // partial month into a new period still counts
  }
  return Math.max(months, 1)
}

export function calcInterest(loanAmount, ratePerMonth, pledgeDate, asOfDate = new Date()) {
  const months = monthsElapsed(pledgeDate, asOfDate)
  const interest = (loanAmount * ratePerMonth * months) / 100
  return { months, interest: Math.round(interest * 100) / 100, total: Math.round((loanAmount + interest) * 100) / 100 }
}

export function isOverdue(pledgeDate, redemptionPeriodMonths) {
  const months = monthsElapsed(pledgeDate)
  return months > redemptionPeriodMonths
}
