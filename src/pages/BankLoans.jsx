import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { nextDueDate, daysUntil, estimateInterestDue, toAnnualRate } from '../lib/bankLoanCalc'

const emptyForm = {
  bank_name: '', branch: '', loan_account_number: '', loan_amount: '',
  interest_rate: '', loan_date: new Date().toISOString().slice(0, 10),
  interest_cycle_months: 12, notes: '',
}

export default function BankLoans() {
  const [loans, setLoans] = useState([])
  const [payments, setPayments] = useState({}) // loan_id -> [payments]
  const [repledges, setRepledges] = useState([])
  const [repledgePayments, setRepledgePayments] = useState({}) // pledge_id -> [payments]
  const [repayTarget, setRepayTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [payTarget, setPayTarget] = useState(null)
  const [filter, setFilter] = useState('active')

  const load = async () => {
    setLoading(true)
    const { data: loanData } = await supabase.from('bank_loans').select('*').order('created_at', { ascending: false })
    setLoans(loanData || [])

    if (loanData?.length) {
      const { data: paymentData } = await supabase.from('bank_loan_payments').select('*').order('payment_date', { ascending: false })
      const grouped = {}
      ;(paymentData || []).forEach((p) => {
        grouped[p.loan_id] = grouped[p.loan_id] || []
        grouped[p.loan_id].push(p)
      })
      setPayments(grouped)
    }

    const { data: repledgeData } = await supabase
      .from('pledges')
      .select('*, customers(name, phone)')
      .eq('is_repledged', true)
      .order('repledge_date', { ascending: false })
    setRepledges(repledgeData || [])

    if (repledgeData?.length) {
      const { data: repayData } = await supabase.from('repledge_payments').select('*').order('payment_date', { ascending: false })
      const grouped = {}
      ;(repayData || []).forEach((p) => {
        grouped[p.pledge_id] = grouped[p.pledge_id] || []
        grouped[p.pledge_id].push(p)
      })
      setRepledgePayments(grouped)
    }

    setLoading(false)
  }

  const handleRecordRepledgePayment = async (pledge, amount, date) => {
    const { error } = await supabase.from('repledge_payments').insert([{ pledge_id: pledge.id, amount, payment_date: date }])
    if (error) { alert('Failed to record payment: ' + error.message); return }
    setRepayTarget(null)
    load()
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(emptyForm); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await supabase.from('bank_loans').insert([{
      ...form,
      loan_amount: parseFloat(form.loan_amount),
      interest_rate: parseFloat(form.interest_rate),
      interest_cycle_months: parseInt(form.interest_cycle_months),
    }])
    setShowForm(false)
    load()
  }

  const handleRecordPayment = async (loan, amount, date) => {
    await supabase.from('bank_loan_payments').insert([{ loan_id: loan.id, amount, payment_date: date }])
    setPayTarget(null)
    load()
  }

  const handleCloseLoan = async (loan) => {
    if (!confirm(`Mark loan from ${loan.bank_name} as closed?`)) return
    await supabase.from('bank_loans').update({ status: 'closed' }).eq('id', loan.id)
    load()
  }

  const filtered = loans.filter((l) => filter === 'all' || l.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-maroon-dark">Bank Loans</h1>
          <p className="text-sm text-charcoal/50 font-tamil">வங்கி கடன்</p>
        </div>
        <button onClick={openNew} className="bg-maroon text-cream px-4 py-2 rounded font-medium hover:bg-maroon-light transition-colors">
          + New Bank Loan
        </button>
      </div>

      <div className="flex gap-1 bg-white rounded p-1 border border-charcoal/10 w-fit mb-5">
        {['active', 'closed', 'all'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${filter === s ? 'bg-maroon text-cream' : 'text-charcoal/60 hover:bg-cream'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-charcoal/50">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No bank loans found. Add your first loan to start tracking interest due dates.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((loan) => {
            const loanPayments = payments[loan.id] || []
            const lastPayment = loanPayments[0]
            const due = nextDueDate(loan.loan_date, loan.interest_cycle_months, lastPayment?.payment_date)
            const days = daysUntil(due)
            const estInterest = estimateInterestDue(loan.loan_amount, loan.interest_rate, loan.interest_cycle_months)
            const isActive = loan.status === 'active'

            let badge = { text: `Due in ${days}d`, cls: 'bg-emerald/10 text-emerald' }
            if (days < 0) badge = { text: `Overdue ${Math.abs(days)}d`, cls: 'bg-red-100 text-red-700' }
            else if (days <= 15) badge = { text: `Due in ${days}d`, cls: 'bg-gold/20 text-gold-dark' }

            return (
              <div key={loan.id} className="bg-white rounded-lg shadow-sm p-4 border border-charcoal/5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-charcoal">{loan.bank_name}</p>
                    <p className="text-xs text-charcoal/50">{loan.branch} {loan.loan_account_number && `· A/C ${loan.loan_account_number}`}</p>
                  </div>
                  {isActive ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${badge.cls}`}>{badge.text}</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal/50">Closed</span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-charcoal/10 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-charcoal/40 text-xs">Loan Amount</p>
                    <p className="font-medium">₹{Number(loan.loan_amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40 text-xs">Rate p.a.</p>
                    <p className="font-medium">{loan.interest_rate}%</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40 text-xs">Est. Interest</p>
                    <p className="font-medium text-maroon">₹{estInterest.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <p className="text-xs text-charcoal/40 mt-2">
                  Next due: {due.toISOString().slice(0, 10)}
                  {lastPayment && ` · Last paid ${lastPayment.payment_date}`}
                </p>

                {isActive && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setPayTarget({ ...loan, computedInterest: estInterest })}
                      className="flex-1 text-sm bg-emerald/10 text-emerald py-1.5 rounded font-medium hover:bg-emerald/20">
                      Record Interest Payment
                    </button>
                    <button onClick={() => handleCloseLoan(loan)}
                      className="text-sm bg-charcoal/10 text-charcoal/60 px-3 rounded font-medium hover:bg-charcoal/20">
                      Close
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Re-pledged Items Section */}
      <h2 className="font-display text-lg text-maroon-dark mt-10 mb-3">Re-pledged Items</h2>
      <p className="text-xs text-charcoal/50 font-tamil mb-3">மறு அடகு வைத்த பொருட்கள் (customer items you've re-pledged to a bank/person)</p>
      {repledges.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No items currently re-pledged. Mark an item as re-pledged from the Pawn Ledger.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repledges.map((p) => {
            const paymentsForPledge = repledgePayments[p.id] || []
            const lastPayment = paymentsForPledge[0]
            const totalPaid = paymentsForPledge.reduce((s, pay) => s + Number(pay.amount), 0)
            const due = nextDueDate(p.repledge_date, p.repledge_cycle_months || 12, lastPayment?.payment_date)
            const days = daysUntil(due)
            const annualRate = toAnnualRate(p.repledge_interest_rate || 0, p.repledge_rate_unit)
            const estInterest = estimateInterestDue(p.repledge_amount || 0, annualRate, p.repledge_cycle_months || 12)
            let badge = { text: `Due in ${days}d`, cls: 'bg-emerald/10 text-emerald' }
            if (days < 0) badge = { text: `Overdue ${Math.abs(days)}d`, cls: 'bg-red-100 text-red-700' }
            else if (days <= 20) badge = { text: `Due in ${days}d`, cls: 'bg-gold/20 text-gold-dark' }

            return (
              <div key={p.id} className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-charcoal">{p.repledge_party_name}</p>
                    <p className="text-xs text-charcoal/50 capitalize">{p.repledge_party_type} · {p.item_description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${badge.cls}`}>{badge.text}</span>
                </div>
                <p className="text-xs text-charcoal/40 mt-1">Customer's item: {p.customers?.name} · {p.customers?.phone}</p>
                <div className="mt-3 pt-3 border-t border-charcoal/10 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-charcoal/40 text-xs">Amount</p>
                    <p className="font-medium">₹{Number(p.repledge_amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40 text-xs">Rate</p>
                    <p className="font-medium">{p.repledge_interest_rate}%/{p.repledge_rate_unit === 'annual' ? 'yr' : 'mo'}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40 text-xs">Paid so far</p>
                    <p className="font-medium text-maroon">₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <p className="text-xs text-charcoal/40 mt-2">
                  Due: {due.toISOString().slice(0, 10)}
                  {lastPayment && ` · Last paid ${lastPayment.payment_date}`}
                </p>
                <button
                  onClick={() => setRepayTarget({ ...p, computedInterest: estInterest })}
                  className="mt-3 w-full text-sm bg-emerald/10 text-emerald py-1.5 rounded font-medium hover:bg-emerald/20"
                >
                  Record Interest Payment
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* New Loan Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl text-maroon-dark mb-4">New Bank Loan</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Bank Name" value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <input placeholder="Branch" value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <input placeholder="Loan Account Number" value={form.loan_account_number}
                onChange={(e) => setForm({ ...form, loan_account_number: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" placeholder="Loan Amount (₹)" value={form.loan_amount}
                  onChange={(e) => setForm({ ...form, loan_amount: e.target.value })}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white" />
                <input required type="number" step="0.01" placeholder="Interest %/yr" value={form.interest_rate}
                  onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-charcoal/50 mb-1">Loan Date</label>
                  <input type="date" value={form.loan_date} onChange={(e) => setForm({ ...form, loan_date: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-charcoal/50 mb-1">Interest cycle (months)</label>
                  <input type="number" value={form.interest_cycle_months}
                    onChange={(e) => setForm({ ...form, interest_cycle_months: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
                </div>
              </div>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light">Save Loan</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-display text-lg text-maroon-dark mb-2">Record Interest Payment</h2>
            <p className="text-sm text-charcoal/60 mb-4">{payTarget.bank_name}</p>
            <label className="block text-sm font-medium mb-1">Payment Date</label>
            <input type="date" id="pay-date" defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white mb-3" />
            <label className="block text-sm font-medium mb-1">Amount Paid (₹)</label>
            <input type="number" id="pay-amount" defaultValue={payTarget.computedInterest}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white mb-4" />
            <div className="flex gap-2">
              <button
                onClick={() => handleRecordPayment(
                  payTarget,
                  parseFloat(document.getElementById('pay-amount').value),
                  document.getElementById('pay-date').value
                )}
                className="flex-1 bg-emerald text-cream py-2 rounded font-medium hover:opacity-90"
              >
                Confirm
              </button>
              <button onClick={() => setPayTarget(null)} className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repledge Payment Modal */}
      {repayTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-display text-lg text-maroon-dark mb-2">Record Re-pledge Interest Payment</h2>
            <p className="text-sm text-charcoal/60 mb-4">{repayTarget.repledge_party_name} — {repayTarget.item_description}</p>
            <label className="block text-sm font-medium mb-1">Payment Date</label>
            <input type="date" id="repay-date" defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white mb-3" />
            <label className="block text-sm font-medium mb-1">Amount Paid (₹)</label>
            <input type="number" id="repay-amount" defaultValue={repayTarget.computedInterest}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white mb-4" />
            <div className="flex gap-2">
              <button
                onClick={() => handleRecordRepledgePayment(
                  repayTarget,
                  parseFloat(document.getElementById('repay-amount').value),
                  document.getElementById('repay-date').value
                )}
                className="flex-1 bg-emerald text-cream py-2 rounded font-medium hover:opacity-90"
              >
                Confirm
              </button>
              <button onClick={() => setRepayTarget(null)} className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
