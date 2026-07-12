import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { nextDueDate, daysUntil } from '../lib/bankLoanCalc'

export default function Dashboard() {
  const [customerCount, setCustomerCount] = useState(null)
  const [activePledges, setActivePledges] = useState(null)
  const [dueSoonLoans, setDueSoonLoans] = useState(null)
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setCustomerCount(count ?? 0))

    supabase
      .from('pledges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .then(({ count }) => setActivePledges(count ?? 0))

    Promise.all([
      supabase.from('bank_loans').select('*').eq('status', 'active'),
      supabase.from('bank_loan_payments').select('loan_id, payment_date').order('payment_date', { ascending: false }),
    ]).then(([{ data: loanData }, { data: paymentData }]) => {
      const lastPaymentByLoan = {}
      ;(paymentData || []).forEach((p) => {
        if (!lastPaymentByLoan[p.loan_id]) lastPaymentByLoan[p.loan_id] = p.payment_date
      })
      const dueSoon = (loanData || []).filter((loan) => {
        const due = nextDueDate(loan.loan_date, loan.interest_cycle_months, lastPaymentByLoan[loan.id])
        return daysUntil(due) <= 15
      })
      setDueSoonLoans(dueSoon.length)
    })

    supabase
      .from('business_settings')
      .select('business_name')
      .eq('id', 1)
      .single()
      .then(({ data }) => setBusinessName(data?.business_name ?? ''))
  }, [])

  const phaseCards = [
    { title: 'Rate Sharing', tamil: 'விலை பகிர்வு', phase: 'Phase 5', desc: 'Daily gold/silver rate + share', to: '/rates' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-maroon-dark">{businessName || 'Dashboard'}</h1>
        <p className="text-charcoal/60 font-tamil mt-1">இன்றைய நிலவரம் · Today's Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-lg p-5 border-l-4 border-gold shadow-sm">
          <p className="text-sm text-charcoal/50">Total Customers</p>
          <p className="font-display text-3xl text-maroon mt-1">{customerCount ?? '—'}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border-l-4 border-gold shadow-sm">
          <p className="text-sm text-charcoal/50">Active Pledges</p>
          <p className="font-display text-3xl text-maroon mt-1">{activePledges ?? '—'}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border-l-4 border-gold shadow-sm">
          <p className="text-sm text-charcoal/50">Bank Interest Due (15d)</p>
          <p className="font-display text-3xl text-maroon mt-1">{dueSoonLoans ?? '—'}</p>
        </div>
      </div>

      <h2 className="font-display text-xl text-maroon-dark mb-4">Coming Up</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {phaseCards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-charcoal/5"
          >
            <span className="text-xs font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded">{c.phase}</span>
            <h3 className="font-display text-lg text-maroon-dark mt-3">{c.title}</h3>
            <p className="text-xs text-charcoal/50 font-tamil">{c.tamil}</p>
            <p className="text-sm text-charcoal/60 mt-2">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
