import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const today = () => new Date().toISOString().slice(0, 10)

export default function Rates() {
  const [rates, setRates] = useState([])
  const [customers, setCustomers] = useState([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ rate_date: today(), gold_22k_rate: '', gold_24k_rate: '', silver_rate: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [shareCustomerId, setShareCustomerId] = useState('')
  const [manualPhone, setManualPhone] = useState('')

  const load = async () => {
    setLoading(true)
    const [{ data: rateData }, { data: custData }, { data: settings }] = await Promise.all([
      supabase.from('metal_rates').select('*').order('rate_date', { ascending: false }).limit(30),
      supabase.from('customers').select('id, name, phone').order('name'),
      supabase.from('business_settings').select('business_name').eq('id', 1).single(),
    ])
    setRates(rateData || [])
    setCustomers(custData || [])
    setBusinessName(settings?.business_name || '')

    const todayRate = (rateData || []).find((r) => r.rate_date === today())
    if (todayRate) {
      setForm({
        rate_date: todayRate.rate_date,
        gold_22k_rate: todayRate.gold_22k_rate ?? '',
        gold_24k_rate: todayRate.gold_24k_rate ?? '',
        silver_rate: todayRate.silver_rate ?? '',
        notes: todayRate.notes ?? '',
      })
    } else if (rateData?.[0]) {
      // prefill with last known rate for easy quick-update
      setForm((f) => ({
        ...f,
        gold_22k_rate: rateData[0].gold_22k_rate ?? '',
        gold_24k_rate: rateData[0].gold_24k_rate ?? '',
        silver_rate: rateData[0].silver_rate ?? '',
      }))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('metal_rates').upsert([{
      rate_date: form.rate_date,
      gold_22k_rate: form.gold_22k_rate ? parseFloat(form.gold_22k_rate) : null,
      gold_24k_rate: form.gold_24k_rate ? parseFloat(form.gold_24k_rate) : null,
      silver_rate: form.silver_rate ? parseFloat(form.silver_rate) : null,
      notes: form.notes,
    }], { onConflict: 'rate_date' })
    setSaving(false)
    load()
  }

  const buildMessage = () => {
    const lines = [
      `*${businessName}*`,
      `Rate as on ${form.rate_date}`,
      '',
    ]
    if (form.gold_22k_rate) lines.push(`22K Gold: ₹${Number(form.gold_22k_rate).toLocaleString('en-IN')}/g`)
    if (form.gold_24k_rate) lines.push(`24K Gold: ₹${Number(form.gold_24k_rate).toLocaleString('en-IN')}/g`)
    if (form.silver_rate) lines.push(`Silver: ₹${Number(form.silver_rate).toLocaleString('en-IN')}/g`)
    if (form.notes) lines.push('', form.notes)
    return lines.join('\n')
  }

  const shareViaWhatsApp = () => {
    const customer = customers.find((c) => c.id === shareCustomerId)
    const rawPhone = customer?.phone || manualPhone
    if (!rawPhone) { alert('Select a customer or enter a phone number'); return }
    let phone = rawPhone.replace(/\D/g, '')
    if (phone.length === 10) phone = '91' + phone // assume India if no country code
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`
    window.open(url, '_blank')
  }

  const broadcastAll = () => {
    if (!confirm(`Open WhatsApp share for all ${customers.length} customers, one tab each?`)) return
    customers.forEach((c) => {
      if (!c.phone) return
      let phone = c.phone.replace(/\D/g, '')
      if (phone.length === 10) phone = '91' + phone
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`, '_blank')
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-maroon-dark">Rate Sharing</h1>
        <p className="text-sm text-charcoal/50 font-tamil">விலை பகிர்வு</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate entry form */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-medium text-charcoal mb-3">Today's Rate</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <input type="date" value={form.rate_date} onChange={(e) => setForm({ ...form, rate_date: e.target.value })}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-charcoal/50 mb-1">22K Gold (₹/g)</label>
                <input type="number" step="0.01" value={form.gold_22k_rate}
                  onChange={(e) => setForm({ ...form, gold_22k_rate: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
              </div>
              <div>
                <label className="block text-xs text-charcoal/50 mb-1">24K Gold (₹/g)</label>
                <input type="number" step="0.01" value={form.gold_24k_rate}
                  onChange={(e) => setForm({ ...form, gold_24k_rate: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-charcoal/50 mb-1">Silver (₹/g)</label>
              <input type="number" step="0.01" value={form.silver_rate}
                onChange={(e) => setForm({ ...form, silver_rate: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
            </div>
            <textarea placeholder="Notes (optional, appears in shared message)" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
            <button type="submit" disabled={saving}
              className="w-full bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Rate'}
            </button>
          </form>
        </div>

        {/* Share panel */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-medium text-charcoal mb-3">Share on WhatsApp</h2>
          <div className="bg-cream rounded p-3 text-sm whitespace-pre-line mb-4 border border-charcoal/10 font-mono">
            {buildMessage()}
          </div>

          <div className="space-y-2 mb-3">
            <select value={shareCustomerId} onChange={(e) => { setShareCustomerId(e.target.value); setManualPhone('') }}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream">
              <option value="">Select a customer...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
            <p className="text-xs text-charcoal/40 text-center">— or —</p>
            <input placeholder="Enter phone number directly" value={manualPhone}
              onChange={(e) => { setManualPhone(e.target.value); setShareCustomerId('') }}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
          </div>

          <button onClick={shareViaWhatsApp}
            className="w-full bg-emerald text-cream py-2 rounded font-medium hover:opacity-90 mb-2">
            Share to Selected Customer
          </button>
          <button onClick={broadcastAll}
            className="w-full bg-gold/10 text-gold-dark py-2 rounded font-medium hover:bg-gold/20 text-sm">
            Share to All Customers ({customers.length}) — opens one tab per customer
          </button>
        </div>
      </div>

      {/* History */}
      <h2 className="font-display text-lg text-maroon-dark mt-8 mb-3">Rate History</h2>
      {loading ? (
        <p className="text-charcoal/50">Loading...</p>
      ) : rates.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No rates recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-maroon-dark text-cream text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">22K Gold</th>
                <th className="px-4 py-2 text-right">24K Gold</th>
                <th className="px-4 py-2 text-right">Silver</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-charcoal/5">
                  <td className="px-4 py-2">{r.rate_date}</td>
                  <td className="px-4 py-2 text-right">{r.gold_22k_rate ? `₹${Number(r.gold_22k_rate).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-2 text-right">{r.gold_24k_rate ? `₹${Number(r.gold_24k_rate).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-2 text-right">{r.silver_rate ? `₹${Number(r.silver_rate).toLocaleString('en-IN')}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
