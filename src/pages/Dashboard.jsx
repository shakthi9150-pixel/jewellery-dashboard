import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { nextDueDate, daysUntil } from '../lib/bankLoanCalc'

export default function Dashboard() {
  const [customerCount, setCustomerCount] = useState(null)
  const [activePledges, setActivePledges] = useState(null)
  const [dueSoonLoans, setDueSoonLoans] = useState(null)
  const [todayRate, setTodayRate] = useState(null)
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

    supabase
      .from('metal_rates')
      .select('*')
      .order('rate_date', { ascending: false })
      .limit(1)
      .then(({ data }) => setTodayRate(data?.[0] ?? null))

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

  const quickLinks = [
    { title: 'New Pledge', tamil: 'புதிய அடகு', desc: 'Record a new pawn item', to: '/pawn-ledger' },
    { title: 'New Invoice', tamil: 'புதிய பட்டியல்', desc: 'Create a GST invoice', to: '/invoices' },
    { title: 'Update Rate', tamil: 'விலை புதுப்பிக்க', desc: 'Set today\'s gold/silver rate', to: '/rates' },
    { title: 'Bank Loans', tamil: 'வங்கி கடன்', desc: 'Check upcoming interest dues', to: '/bank-loans' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-maroon-dark">{businessName || 'Dashboard'}</h1>
        <p className="text-charcoal/60 font-tamil mt-1">இன்றைய நிலவரம் · Today's Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

      <div className="bg-maroon-dark rounded-lg p-5 mb-10 text-cream flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-cream/50 uppercase tracking-wide">Today's Rate {todayRate ? `· ${todayRate.rate_date}` : ''}</p>
          {todayRate ? (
            <div className="flex gap-6 mt-1">
              {todayRate.gold_22k_rate && <p><span className="text-gold font-display text-xl">₹{Number(todayRate.gold_22k_rate).toLocaleString('en-IN')}</span> <span className="text-cream/60 text-sm">22K/g</span></p>}
              {todayRate.gold_24k_rate && <p><span className="text-gold font-display text-xl">₹{Number(todayRate.gold_24k_rate).toLocaleString('en-IN')}</span> <span className="text-cream/60 text-sm">24K/g</span></p>}
              {todayRate.silver_rate && <p><span className="text-gold font-display text-xl">₹{Number(todayRate.silver_rate).toLocaleString('en-IN')}</span> <span className="text-cream/60 text-sm">Silver/g</span></p>}
            </div>
          ) : (
            <p className="text-cream/70 mt-1">No rate set yet today.</p>
          )}
        </div>
        <Link to="/rates" className="bg-gold text-maroon-dark px-4 py-2 rounded font-medium text-sm hover:bg-gold-light">
          Update & Share →
        </Link>
      </div>

      <h2 className="font-display text-xl text-maroon-dark mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-charcoal/5"
          >
            <h3 className="font-display text-lg text-maroon-dark">{c.title}</h3>
            <p className="text-xs text-charcoal/50 font-tamil">{c.tamil}</p>
            <p className="text-sm text-charcoal/60 mt-2">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
