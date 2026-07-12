import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { calcInterest, isOverdue } from '../lib/pawnCalc'

const emptyForm = {
  customer_id: '',
  item_description: '',
  metal_type: 'gold',
  weight_grams: '',
  loan_amount: '',
  interest_rate: '',
  pledge_date: new Date().toISOString().slice(0, 10),
  redemption_period_months: 12,
  notes: '',
}

export default function PawnLedger() {
  const [pledges, setPledges] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [redeemTarget, setRedeemTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    const [{ data: pledgeData }, { data: custData }, { data: settings }] = await Promise.all([
      supabase.from('pledges').select('*, customers(name, phone)').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name, phone').order('name'),
      supabase.from('business_settings').select('pawn_interest_rate').eq('id', 1).single(),
    ])
    setPledges(pledgeData || [])
    setCustomers(custData || [])
    if (settings) setForm((f) => ({ ...f, interest_rate: settings.pawn_interest_rate }))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm((f) => ({ ...emptyForm, interest_rate: f.interest_rate }))
    setPhotoFile(null)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    let photo_url = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `pledges/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('pledge-photos').upload(path, photoFile)
      if (!uploadErr) {
        const { data } = supabase.storage.from('pledge-photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    await supabase.from('pledges').insert([{
      ...form,
      weight_grams: form.weight_grams ? parseFloat(form.weight_grams) : null,
      loan_amount: parseFloat(form.loan_amount),
      interest_rate: parseFloat(form.interest_rate),
      redemption_period_months: parseInt(form.redemption_period_months),
      item_photo_url: photo_url,
    }])

    setUploading(false)
    setShowForm(false)
    load()
  }

  const handleRedeem = async (pledge, redeemedAmount) => {
    await supabase.from('pledges').update({
      status: 'redeemed',
      redeemed_date: new Date().toISOString().slice(0, 10),
      redeemed_amount: redeemedAmount,
    }).eq('id', pledge.id)
    setRedeemTarget(null)
    load()
  }

  const filtered = pledges.filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch =
      p.item_description?.toLowerCase().includes(search.toLowerCase()) ||
      p.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.customers?.phone?.includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-maroon-dark">Pawn Ledger</h1>
          <p className="text-sm text-charcoal/50 font-tamil">அடகு பதிவு</p>
        </div>
        <button onClick={openNew} className="bg-maroon text-cream px-4 py-2 rounded font-medium hover:bg-maroon-light transition-colors">
          + New Pledge
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <input
          type="text"
          placeholder="Search item / customer / phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-charcoal/20 bg-white flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <div className="flex gap-1 bg-white rounded p-1 border border-charcoal/10">
          {['active', 'redeemed', 'auctioned', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                filter === s ? 'bg-maroon text-cream' : 'text-charcoal/60 hover:bg-cream'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-charcoal/50">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No pledges found. Add your first pledge to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const { months, interest, total } = calcInterest(p.loan_amount, p.interest_rate, p.pledge_date)
            const overdue = p.status === 'active' && isOverdue(p.pledge_date, p.redemption_period_months)
            return (
              <div key={p.id} className="bg-white rounded-lg shadow-sm p-4 border border-charcoal/5">
                <div className="flex gap-3">
                  {p.item_photo_url ? (
                    <img src={p.item_photo_url} alt="" className="w-20 h-20 object-cover rounded border border-charcoal/10" />
                  ) : (
                    <div className="w-20 h-20 rounded bg-cream border border-dashed border-charcoal/20 flex items-center justify-center text-charcoal/30 text-xs">
                      No photo
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-charcoal truncate">{p.item_description}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap capitalize ${
                        p.status === 'active' ? (overdue ? 'bg-red-100 text-red-700' : 'bg-emerald/10 text-emerald')
                        : p.status === 'redeemed' ? 'bg-charcoal/10 text-charcoal/60'
                        : 'bg-gold/10 text-gold-dark'
                      }`}>
                        {overdue ? 'Overdue' : p.status}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal/60">{p.customers?.name} · {p.customers?.phone}</p>
                    <p className="text-xs text-charcoal/40 mt-1">
                      {p.metal_type} {p.weight_grams ? `· ${p.weight_grams}g` : ''} · Pledged {p.pledge_date}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-charcoal/10 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-charcoal/40 text-xs">Loan</p>
                    <p className="font-medium">₹{Number(p.loan_amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40 text-xs">Interest ({months}mo)</p>
                    <p className="font-medium">₹{interest.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40 text-xs">{p.status === 'redeemed' ? 'Paid' : 'Due Today'}</p>
                    <p className="font-medium text-maroon">
                      ₹{(p.status === 'redeemed' ? p.redeemed_amount : total).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {p.status === 'active' && (
                  <button
                    onClick={() => setRedeemTarget({ ...p, computedTotal: total })}
                    className="mt-3 w-full text-sm bg-emerald/10 text-emerald py-1.5 rounded font-medium hover:bg-emerald/20"
                  >
                    Mark Redeemed
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New Pledge Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl text-maroon-dark mb-4">New Pledge</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white">
                <option value="">Select Customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
              </select>

              <input required placeholder="Item description (e.g. 22K Gold Chain)" value={form.item_description}
                onChange={(e) => setForm({ ...form, item_description: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />

              <div className="grid grid-cols-2 gap-2">
                <select value={form.metal_type} onChange={(e) => setForm({ ...form, metal_type: e.target.value })}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white">
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="other">Other</option>
                </select>
                <input type="number" step="0.01" placeholder="Weight (g)" value={form.weight_grams}
                  onChange={(e) => setForm({ ...form, weight_grams: e.target.value })}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Item / note photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input required type="number" step="1" placeholder="Loan Amount (₹)" value={form.loan_amount}
                  onChange={(e) => setForm({ ...form, loan_amount: e.target.value })}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white" />
                <input required type="number" step="0.1" placeholder="Interest %/mo" value={form.interest_rate}
                  onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                  className="px-3 py-2 rounded border border-charcoal/20 bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-charcoal/50 mb-1">Pledge Date</label>
                  <input type="date" value={form.pledge_date} onChange={(e) => setForm({ ...form, pledge_date: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-charcoal/50 mb-1">Redemption period (months)</label>
                  <input type="number" value={form.redemption_period_months}
                    onChange={(e) => setForm({ ...form, redemption_period_months: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
                </div>
              </div>

              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={uploading}
                  className="flex-1 bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light disabled:opacity-60">
                  {uploading ? 'Saving...' : 'Save Pledge'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Confirm Modal */}
      {redeemTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-display text-lg text-maroon-dark mb-2">Confirm Redemption</h2>
            <p className="text-sm text-charcoal/60 mb-4">{redeemTarget.item_description} — {redeemTarget.customers?.name}</p>
            <label className="block text-sm font-medium mb-1">Amount Collected (₹)</label>
            <input
              type="number"
              defaultValue={redeemTarget.computedTotal}
              id="redeem-amount"
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleRedeem(redeemTarget, parseFloat(document.getElementById('redeem-amount').value))}
                className="flex-1 bg-emerald text-cream py-2 rounded font-medium hover:opacity-90"
              >
                Confirm
              </button>
              <button onClick={() => setRedeemTarget(null)} className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
