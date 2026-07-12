// Indian financial year runs April 1 - March 31.
export function currentFinancialYear(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-12
  const startYear = month >= 4 ? year : year - 1
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0')
  return `${startYear}-${endYearShort}`
}

export function calcInvoiceTotals(items, gstRatePercent) {
  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
  const halfRate = gstRatePercent / 2
  const cgst_amount = Math.round(subtotal * (halfRate / 100) * 100) / 100
  const sgst_amount = Math.round(subtotal * (halfRate / 100) * 100) / 100
  const total_amount = Math.round((subtotal + cgst_amount + sgst_amount) * 100) / 100
  return { subtotal: Math.round(subtotal * 100) / 100, cgst_rate: halfRate, sgst_rate: halfRate, cgst_amount, sgst_amount, total_amount }
}
