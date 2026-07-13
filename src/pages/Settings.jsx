import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CATEGORIES = ['necklace', 'ring', 'bangle', 'earring', 'other']

export default function Settings() {
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [gallery, setGallery] = useState([])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [newCategory, setNewCategory] = useState('necklace')

  const loadGallery = async () => {
    const { data } = await supabase.from('jewellery_gallery').select('*').order('created_at', { ascending: false })
    setGallery(data || [])
  }

  useEffect(() => {
    supabase.from('business_settings').select('*').eq('id', 1).single()
      .then(({ data }) => setForm(data))
    loadGallery()
  }, [])

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const path = `logo-${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('business-assets').upload(path, file, { upsert: true })
    if (uploadErr) {
      alert('Logo upload failed: ' + uploadErr.message)
      setUploadingLogo(false)
      return
    }
    const { data } = supabase.storage.from('business-assets').getPublicUrl(path)
    const newForm = { ...form, logo_url: data.publicUrl }
    setForm(newForm)
    await supabase.from('business_settings').update({ logo_url: data.publicUrl }).eq('id', 1)
    setUploadingLogo(false)
  }

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingGallery(true)
    const ext = file.name.split('.').pop()
    const path = `jewellery/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('business-assets').upload(path, file)
    if (uploadErr) {
      alert('Photo upload failed: ' + uploadErr.message)
      setUploadingGallery(false)
      return
    }
    const { data } = supabase.storage.from('business-assets').getPublicUrl(path)
    await supabase.from('jewellery_gallery').insert([{ image_url: data.publicUrl, category: newCategory }])
    setUploadingGallery(false)
    e.target.value = ''
    loadGallery()
  }

  const handleDeletePhoto = async (item) => {
    if (!confirm('Delete this photo?')) return
    await supabase.from('jewellery_gallery').delete().eq('id', item.id)
    loadGallery()
  }

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

      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <label className="block text-sm font-medium mb-2">Business Logo</label>
        <div className="flex items-center gap-4">
          {form.logo_url ? (
            <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded object-contain border border-charcoal/10 bg-cream" />
          ) : (
            <div className="w-16 h-16 rounded bg-cream border border-dashed border-charcoal/20 flex items-center justify-center text-charcoal/30 text-xs">
              No logo
            </div>
          )}
          <div>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
            {uploadingLogo && <p className="text-xs text-charcoal/40 mt-1">Uploading...</p>}
            <p className="text-xs text-charcoal/40 mt-1">Used on the rate card image shared to customers.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <label className="block text-sm font-medium mb-2">Jewellery Photos</label>
        <p className="text-xs text-charcoal/40 mb-3">
          Upload real photos of your jewellery (necklace, ring, bangle, earring). These appear on the rate card image you share — much more attractive than generic icons, and it's your own stock.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-2 rounded border border-charcoal/20 text-sm capitalize">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={handleGalleryUpload} className="text-sm flex-1" />
        </div>
        {uploadingGallery && <p className="text-xs text-charcoal/40 mb-3">Uploading...</p>}

        {gallery.length === 0 ? (
          <p className="text-xs text-charcoal/40 border border-dashed border-charcoal/20 rounded p-4 text-center">
            No photos yet. Add your first jewellery photo above.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {gallery.map((g) => (
              <div key={g.id} className="relative group">
                <img src={g.image_url} alt={g.category} className="w-full aspect-square object-cover rounded border border-charcoal/10" />
                <p className="text-[10px] text-charcoal/40 capitalize text-center mt-0.5">{g.category}</p>
                <button
                  onClick={() => handleDeletePhoto(g)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
