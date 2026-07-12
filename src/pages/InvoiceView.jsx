import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function InvoiceView() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: inv }, { data: its }, { data: biz }] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', id).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sort_order'),
        supabase.from('business_settings').select('*').eq('id', 1).single(),
      ])
      setInvoice(inv)
      setItems(its || [])
      setBusiness(biz)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <p className="text-charcoal/50">Loading...</p>
  if (!invoice) return <p className="text-charcoal/50">Invoice not found.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to="/invoices" className="text-maroon hover:underline text-sm">← Back to Invoices</Link>
        <button onClick={() => window.print()} className="bg-maroon text-cream px-4 py-2 rounded font-medium hover:bg-maroon-light">
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto print:shadow-none print:p-0" id="invoice-print">
        <div className="flex justify-between items-start border-b-2 border-maroon pb-4 mb-4">
          <div>
            <h1 className="font-display text-2xl text-maroon-dark">{business?.business_name}</h1>
            <p className="text-sm text-charcoal/60 whitespace-pre-line">{business?.address}</p>
            {business?.gstin && <p className="text-sm text-charcoal/60">GSTIN: {business.gstin}</p>}
            {business?.phone && <p className="text-sm text-charcoal/60">Phone: {business.phone}</p>}
          </div>
          <div className="text-right">
            <p className="font-display text-lg text-maroon">TAX INVOICE</p>
            <p className="text-sm text-charcoal/70">#{invoice.invoice_number}</p>
            <p className="text-sm text-charcoal/70">{invoice.invoice_date}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-charcoal/40 uppercase tracking-wide mb-1">Bill To</p>
          <p className="font-medium text-charcoal">{invoice.customer_name_snapshot}</p>
          <p className="text-sm text-charcoal/60">{invoice.customer_phone_snapshot}</p>
          <p className="text-sm text-charcoal/60">{invoice.customer_address_snapshot}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-charcoal/20 text-left text-charcoal/50">
              <th className="py-2">Description</th>
              <th className="py-2">HSN</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-charcoal/5">
                <td className="py-2">{it.description}{it.weight_grams ? ` (${it.weight_grams}g)` : ''}</td>
                <td className="py-2">{it.hsn_code}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">₹{Number(it.rate).toLocaleString('en-IN')}</td>
                <td className="py-2 text-right">₹{Number(it.amount).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-56 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-charcoal/60">Subtotal</span><span>₹{Number(invoice.subtotal).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">CGST ({invoice.cgst_rate}%)</span><span>₹{Number(invoice.cgst_amount).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">SGST ({invoice.sgst_rate}%)</span><span>₹{Number(invoice.sgst_amount).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-semibold text-maroon border-t border-charcoal/20 pt-1 mt-1 text-base">
              <span>Total</span><span>₹{Number(invoice.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-charcoal/40 mt-8 text-center">Thank you for your business.</p>
      </div>
    </div>
  )
}
