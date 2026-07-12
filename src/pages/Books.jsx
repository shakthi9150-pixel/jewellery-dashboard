import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CATEGORIES = {
  income: ['Sales Revenue', 'Interest Income', 'Other Income'],
  expense: ['Rent', 'Salary', 'Electricity', 'Purchase', 'Maintenance', 'Other Expense'],
}

const emptyForm = { entry_date: new Date().toISOString().slice(0, 10), entry_type: 'expense', category: 'Rent', description: '', amount: '' }

export default function Books() {
  const [entries, setEntries] = useState([])
  const [invoiceRevenue, setInvoiceRevenue] = useState(0)
  const [repledgeInterestPaid, setRepledgeInterestPaid] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

  const load = async () => {
    setLoading(true)
    const monthStart = `${month}-01`
    const monthEnd = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0).toISOString().slice(0, 10)

    const [{ data: entryData }, { data: invData }, { data: repayData }] = await Promise.all([
      supabase.from('ledger_entries').select('*').gte('entry_date', monthStart).lte('entry_date', monthEnd).order('entry_date', { ascending: false }),
      supabase.from('invoices').select('total_amount').gte('invoice_date', monthStart).lte('invoice_date', monthEnd),
      supabase.from('repledge_payments').select('amount').gte('payment_date', monthStart).lte('payment_date', monthEnd),
    ])
    setEntries(entryData || [])
    setInvoiceRevenue((invData || []).reduce((s, i) => s + Number(i.total_amount), 0))
    setRepledgeInterestPaid((repayData || []).reduce((s, r) => s + Number(r.amount), 0))
    setLoading(false)
  }

  useEffect(() => { load() }, [month])

  const { totalIncome, totalExpense, net } = useMemo(() => {
    const manualIncome = entries.filter((e) => e.entry_type === 'income').reduce((s, e) => s + Number(e.amount), 0)
    const manualExpense = entries.filter((e) => e.entry_type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
    const income = manualIncome + invoiceRevenue
    const expense = manualExpense + repledgeInterestPaid
    return { totalIncome: income, totalExpense: expense, net: income - expense }
  }, [entries, invoiceRevenue, repledgeInterestPaid])

  const openNew = (type) => {
    setForm({ ...emptyForm, entry_type: type, category: CATEGORIES[type][0] })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await supabase.from('ledger_entries').insert([{ ...form, amount: parseFloat(form.amount) }])
    setShowForm(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return
    await supabase.from('ledger_entries').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-maroon-dark">Books</h1>
          <p className="text-sm text-charcoal/50 font-tamil">கணக்குப் புத்தகம்</p>
        </div>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded border border-charcoal/20 bg-white text-sm" />
          <button onClick={() => openNew('income')} className="bg-emerald/10 text-emerald px-3 py-2 rounded text-sm font-medium hover:bg-emerald/20">+ Income</button>
          <button onClick={() => openNew('expense')} className="bg-maroon text-cream px-3 py-2 rounded text-sm font-medium hover:bg-maroon-light">+ Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border-l-4 border-emerald shadow-sm">
          <p className="text-xs text-charcoal/50">Total Income</p>
          <p className="font-display text-2xl text-emerald mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-charcoal/40 mt-1">incl. ₹{invoiceRevenue.toLocaleString('en-IN')} from invoices</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-maroon shadow-sm">
          <p className="text-xs text-charcoal/50">Total Expense</p>
          <p className="font-display text-2xl text-maroon mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
          {repledgeInterestPaid > 0 && (
            <p className="text-[11px] text-charcoal/40 mt-1">incl. ₹{repledgeInterestPaid.toLocaleString('en-IN')} re-pledge interest paid</p>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-gold shadow-sm">
          <p className="text-xs text-charcoal/50">Net</p>
          <p className={`font-display text-2xl mt-1 ${net >= 0 ? 'text-emerald' : 'text-maroon'}`}>₹{net.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-charcoal/50">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No manual entries this month. Invoice revenue is tracked automatically.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-maroon-dark text-cream text-left">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-charcoal/5 hover:bg-cream/60">
                  <td className="px-4 py-3 text-charcoal/70">{e.entry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${e.entry_type === 'income' ? 'bg-emerald/10 text-emerald' : 'bg-maroon/10 text-maroon'}`}>
                      {e.entry_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3 text-charcoal/60">{e.description}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-display text-lg text-maroon-dark mb-4 capitalize">Add {form.entry_type}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white">
                {CATEGORIES[form.entry_type].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <input required type="number" step="0.01" placeholder="Amount (₹)" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
