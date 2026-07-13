import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { drawRateCard, CANVAS_WIDTH, CANVAS_HEIGHT, JEWELLERY_MOTIFS } from '../lib/rateCardTemplates'
import { RATE_CARD_THEMES } from '../lib/rateCardThemes'

const MOTIF_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'ring', label: 'Ring' },
  { id: 'bangle', label: 'Bangle' },
  { id: 'earring', label: 'Earring' },
]

const today = () => new Date().toISOString().slice(0, 10)

export default function Rates() {
  const [rates, setRates] = useState([])
  const [customers, setCustomers] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ rate_date: today(), gold_22k_rate: '', gold_24k_rate: '', silver_rate: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [shareCustomerId, setShareCustomerId] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [copied, setCopied] = useState(false)
  const [themeId, setThemeId] = useState(RATE_CARD_THEMES[0].id)
  const [motifKey, setMotifKey] = useState('necklace')
  const [imageReady, setImageReady] = useState(false)
  const canvasRef = useRef(null)

  const load = async () => {
    setLoading(true)
    const [{ data: rateData }, { data: custData }, { data: settings }] = await Promise.all([
      supabase.from('metal_rates').select('*').order('rate_date', { ascending: false }).limit(30),
      supabase.from('customers').select('id, name, phone').order('name'),
      supabase.from('business_settings').select('*').eq('id', 1).single(),
    ])
    setRates(rateData || [])
    setCustomers(custData || [])
    setBusiness(settings || null)

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

  // Redraw the rate card whenever the relevant data or template changes
  useEffect(() => {
    if (!business || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    setImageReady(false)
    const data = {
      businessName: business.business_name,
      address: business.address,
      phone: business.phone,
      logoUrl: business.logo_url,
      date: form.rate_date,
      gold22k: form.gold_22k_rate,
      gold24k: form.gold_24k_rate,
      silver: form.silver_rate,
    }
    const theme = RATE_CARD_THEMES.find((t) => t.id === themeId) || RATE_CARD_THEMES[0]
    drawRateCard(ctx, data, theme, motifKey).then(() => setImageReady(true))
  }, [business, themeId, motifKey, form.rate_date, form.gold_22k_rate, form.gold_24k_rate, form.silver_rate])

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
    const lines = [`*${business?.business_name || ''}*`, `Rate as on ${form.rate_date}`, '']
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
    if (phone.length === 10) phone = '91' + phone
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`
    window.open(url, '_blank')
  }

  const copyMessage = async () => {
    await navigator.clipboard.writeText(buildMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getCanvasBlob = () => new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'))

  const downloadImage = async () => {
    const blob = await getCanvasBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rate-card-${form.rate_date}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareImage = async () => {
    const blob = await getCanvasBlob()
    const file = new File([blob], `rate-card-${form.rate_date}.png`, { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Today\'s Rate', text: buildMessage() })
      } catch (err) {
        if (err.name !== 'AbortError') alert('Share failed: ' + err.message)
      }
    } else {
      alert('Direct image share is not supported on this browser/device. Downloading instead — please attach it manually in WhatsApp.')
      downloadImage()
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-maroon-dark">Rate Sharing</h1>
        <p className="text-sm text-charcoal/50 font-tamil">விலை பகிர்வு</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            <textarea placeholder="Notes (optional, appears in text message)" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded border border-charcoal/20 bg-cream" />
            <button type="submit" disabled={saving}
              className="w-full bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Rate'}
            </button>
          </form>
        </div>

        {/* Text share panel */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="font-medium text-charcoal mb-3">Share as Text</h2>
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
            className="w-full bg-emerald text-cream py-2 rounded font-medium hover:opacity-90 mb-3">
            Share to Selected Customer
          </button>

          <div className="border-t border-charcoal/10 pt-3">
            <p className="text-xs text-charcoal/50 mb-2">
              To send to <b>all customers at once</b>, use a WhatsApp Broadcast List (set up once in your phone: WhatsApp → Menu → New Broadcast → add all customer numbers). Then copy today's message here and paste it into that broadcast list.
            </p>
            <button onClick={copyMessage}
              className="w-full bg-gold/10 text-gold-dark py-2 rounded font-medium hover:bg-gold/20 text-sm">
              {copied ? 'Copied ✓' : 'Copy Rate Message'}
            </button>
          </div>
        </div>
      </div>

      {/* Rate Card Image */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-medium text-charcoal">Rate Card Image</h2>
          <p className="text-xs text-charcoal/40">{RATE_CARD_THEMES.find((t) => t.id === themeId)?.name}</p>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-5">
          {RATE_CARD_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              title={t.name}
              className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 ${
                themeId === t.id ? 'border-charcoal scale-110' : 'border-transparent'
              }`}
              style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]})` }}
            />
          ))}
        </div>

        <p className="text-xs text-charcoal/50 mb-2">Jewellery motif (decorative illustration on the card):</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {MOTIF_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMotifKey(m.id)}
              className={`px-3 py-1.5 rounded text-sm transition-colors border ${
                motifKey === m.id ? 'bg-maroon text-cream border-maroon' : 'bg-cream text-charcoal/60 border-charcoal/10 hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs rounded-lg overflow-hidden shadow-md border border-charcoal/10">
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-auto block" />
          </div>

          <div className="flex gap-2 mt-4 w-full max-w-xs">
            <button onClick={shareImage} disabled={!imageReady}
              className="flex-1 bg-emerald text-cream py-2 rounded font-medium hover:opacity-90 disabled:opacity-50 text-sm">
              Share to WhatsApp
            </button>
            <button onClick={downloadImage} disabled={!imageReady}
              className="flex-1 bg-charcoal/10 text-charcoal py-2 rounded font-medium hover:bg-charcoal/20 disabled:opacity-50 text-sm">
              Download
            </button>
          </div>
          {!business?.logo_url && (
            <p className="text-xs text-charcoal/40 mt-3 text-center">
              Tip: add a business logo in Settings for a more branded card.
            </p>
          )}
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
