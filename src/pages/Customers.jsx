import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const emptyForm = { name: '', phone: '', alt_phone: '', address: '', aadhar_number: '', pan_number: '', notes: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (!error) setCustomers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }
  const openEdit = (c) => { setForm(c); setEditingId(c.id); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await supabase.from('customers').update(form).eq('id', editingId)
    } else {
      await supabase.from('customers').insert([form])
    }
    setShowForm(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer? / இந்த வாடிக்கையாளரை நீக்கவா?')) return
    await supabase.from('customers').delete().eq('id', id)
    load()
  }

  const filtered = customers.filter(
    (c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-maroon-dark">Customers</h1>
          <p className="text-sm text-charcoal/50 font-tamil">வாடிக்கையாளர்கள்</p>
        </div>
        <button
          onClick={openNew}
          className="bg-maroon text-cream px-4 py-2 rounded font-medium hover:bg-maroon-light transition-colors"
        >
          + Add Customer
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name or phone... / பெயர் / எண் தேடு"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm mb-5 px-3 py-2 rounded border border-charcoal/20 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
      />

      {loading ? (
        <p className="text-charcoal/50">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center text-charcoal/40 border border-dashed border-charcoal/20">
          No customers yet. Add your first customer to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-maroon-dark text-cream text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-charcoal/5 hover:bg-cream/60">
                  <td className="px-4 py-3 font-medium text-charcoal">{c.name}</td>
                  <td className="px-4 py-3 text-charcoal/70">{c.phone}</td>
                  <td className="px-4 py-3 text-charcoal/70 max-w-xs truncate">{c.address}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(c)} className="text-maroon hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl text-maroon-dark mb-4">
              {editingId ? 'Edit Customer' : 'New Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Name / பெயர்" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <input required placeholder="Phone / தொலைபேசி எண்" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <input placeholder="Alternate Phone" value={form.alt_phone || ''}
                onChange={(e) => setForm({ ...form, alt_phone: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <textarea placeholder="Address / முகவரி" value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" rows={2} />
              <input placeholder="Aadhar Number" value={form.aadhar_number || ''}
                onChange={(e) => setForm({ ...form, aadhar_number: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <input placeholder="PAN Number" value={form.pan_number || ''}
                onChange={(e) => setForm({ ...form, pan_number: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" />
              <textarea placeholder="Notes" value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 rounded border border-charcoal/20 bg-white" rows={2} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-maroon text-cream py-2 rounded font-medium hover:bg-maroon-light">
                  Save
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
    </div>
  )
}
