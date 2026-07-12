import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Settings() {
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('business_settings').select('*').eq('id', 1).single()
      .then(({ data }) => setForm(data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await supabase.from('business_settings').update(form).eq('id', 1)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!form) return <p className="text-charcoal/50">Loading...</p>

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-maroon-dark mb-1">Business Settings</h1>
      <p className="text-sm text-charcoal/50 font-tamil mb-6">வணிக அமைப்புகள்</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input value={form.business_name || ''} onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            className="w-full px-3 py-2 rounded border border-charcoal/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GSTIN</label>
          <input value={form.gstin || ''} onChange={(e) => setForm({ ...form, gstin: e.target.value })}
            placeholder="33XXXXX0000X1Z0"
            className="w-full px-3 py-2 rounded border border-charcoal/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2} className="w-full px-3 py-2 rounded border border-charcoal/20" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 rounded border border-charcoal/20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">GST Rate (%)</label>
            <input type="number" step="0.1" value={form.gold_gst_rate ?? ''}
              onChange={(e) => setForm({ ...form, gold_gst_rate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 rounded border border-charcoal/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pawn Interest (%/month)</label>
            <input type="number" step="0.1" value={form.pawn_interest_rate ?? ''}
              onChange={(e) => setForm({ ...form, pawn_interest_rate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 rounded border border-charcoal/20" />
          </div>
        </div>
        <button type="submit" className="bg-maroon text-cream px-5 py-2 rounded font-medium hover:bg-maroon-light">
          Save Settings
        </button>
        {saved && <span className="ml-3 text-emerald text-sm">Saved ✓</span>}
      </form>
    </div>
  )
}
