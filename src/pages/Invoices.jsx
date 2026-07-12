import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { currentFinancialYear, calcInvoiceTotals } from '../lib/invoiceCalc'

const emptyItem = () => ({ description: '', hsn_code: '7113', quantity: 1, weight_grams: '', rate: '', amount: 0 })

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const [customerId, setCustomerId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState([emptyItem()])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: invData }, { data: custData }, { data: settingsData }] = await Promise.all([
      supabase.from('invoices').select('*').order('invoice_date', { ascending: false }),
      supabase.from('customers').select('id, name, phone, address').order('name'),
      supabase.from('business_settings').select('*').eq('id', 1).single(),
    ])
    setInvoices(invData || [])
    setCustomers(custData || [])
    setSettings(settingsData)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setCustomerId('')
    setInvoiceDate(new Date().toISOString().slice(0, 10))
    setItems([emptyItem()])
    setShowForm(true)
  }

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      const qty = parseFloat(next[idx].quantity) || 0
      const rate = parseFloat(next[idx].rate) || 0
      next[idx].amount = Math.round(qty * rate * 100) / 100
      return next
    })
  }

  const addItemRow = () => setItems((prev) => [...prev, emptyItem()])
  const removeItemRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const totals = calcInvoiceTotals(items, settings?.gold_gst_rate ?? 3)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerId) return
    setSaving(true)

    const customer = customers.find((c) => c.id === customerId)
    const fy = currentFinancialYear(new Date(invoiceDate))

    const { data: numResult, error: numErr } = await supabase.rpc('next_invoice_number', { fy })
    if (numErr || !numResult?.[0]) {
      alert('Invoice number generation failed: ' + (numErr?.message || 'unknown error'))
      setSaving(false)
      return
    }
    const { invoice_number, seq } = numResult[0]

    const { data: invoice, error: invErr } = await supabase.from('invoices').insert([{
      invoice_number,
      financial_year: fy,
      sequence_number: seq,
      customer_id: customerId,
      customer_name_snapshot: customer?.name,
      customer_phone_snapshot: customer?.phone,
      customer_address_snapshot: customer?.address,
      invoice_date: invoiceDate,
      subtotal: totals.subtotal,
      cgst_rate: totals.cgst_rate,
      sgst_rate: totals.sgst_rate,
      cgst_amount: totals.cgst_amount,
      sgst_amount: totals.sgst_amount,
      total_amount: totals.total_amount,
    }]).select().single()

    if (invErr) {
      alert('Invoice creation failed: ' + invErr.message)
      setSaving(false)
      return
    }

    const itemRows = items
      .filter((it) => it.description)
      .map((it, idx) => ({
        invoice_id: invoice.id,
        description: it.description,
        hsn_code: it.hsn_code,
        quantity: parseFloat(it.quantity) || 1,
        weight_grams: it.weight_grams ? parseFloat(it.weight_grams) : null,
        rate: parseFloat(it.rate) || 0,
        amount: it.amount,
        sort_order: idx,
      }))

    await supabase.from('invoice_items').insert(itemRows)

    setSaving(false)
    setShowForm(false)
    load()
  }

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name_snapshot?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-maroon-dark">GST Invoices</h1>
          <p className="text-sm text-charcoal/50 font-tamil">விலைப்பட்டியல்</p>
        </div>
        <button onClick={openNew} className="bg-maroon text-cream px-4 py-2 rounded font-medium hover:bg-maroon-light transition-colors">
          + New Invoice
        </button>
      </div>

      <input
        type="text"
        placeholder="Search invoice # or customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm mb-5 px-3 py-2 rounded border border-charcoal/20 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
      />

      {loading ? (
        <p className="text-charcoal/50">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No invoices yet. Create your first GST invoice.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-maroon-dark text-cream text-left">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-charcoal/5 hover:bg-cream/60">
                  <td className="px-4 py-3 font-medium text-maroon">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-charcoal/70">{inv.invoice_date}</td>
                  <td className="px-4 py-3 text-charcoal/70">{inv.customer_name_snapshot}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{Number(inv.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/invoices/${inv.id}`} className="text-maroon hover:underline">View / Print</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl text-maroon-dark mb-4">New GST Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white">
                  <option value="">Select Customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white" />
              </div>

              <div className="bg-white rounded border border-charcoal/10 p-3">
                <p className="text-sm font-medium mb-2">Items</p>
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <input placeholder="Description" value={it.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="col-span-4 px-2 py-1.5 rounded border border-charcoal/20 text-sm" />
                    <input placeholder="HSN" value={it.hsn_code}
                      onChange={(e) => updateItem(idx, 'hsn_code', e.target.value)}
                      className="col-span-2 px-2 py-1.5 rounded border border-charcoal/20 text-sm" />
                    <input type="number" placeholder="Qty" value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="col-span-1 px-2 py-1.5 rounded border border-charcoal/20 text-sm" />
                    <input type="number" placeholder="Rate ₹" value={it.rate}
                      onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                      className="col-span-2 px-2 py-1.5 rounded border border-charcoal/20 text-sm" />
                    <p className="col-span-2 text-sm text-right pr-2">₹{it.amount.toLocaleString('en-IN')}</p>
                    <button type="button" onClick={() => removeItemRow(idx)}
                      className="col-span-1 text-red-500 text-sm hover:underline">✕</button>
                  </div>
                ))}
                <button type="button" onClick={addItemRow} className="text-sm text-maroon hover:underline">+ Add item</button>
              </div>

              <div className="bg-white rounded border border-charcoal/10 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-charcoal/60"><span>CGST ({totals.cgst_rate}%)</span><span>₹{totals.cgst_amount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-charcoal/60"><span>SGST ({totals.sgst_rate}%)</span><span>₹{totals.sgst_amount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-semibold text-maroon border-t border-charcoal/10 pt-1 mt-1"><span>Total</span><span>₹{totals.total_amount.toLocaleString('en-IN')}</span></div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light disabled:opacity-60">
                  {saving ? 'Saving...' : 'Create Invoice'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
