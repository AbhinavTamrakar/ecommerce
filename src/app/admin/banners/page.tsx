'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Image as ImageIcon, Plus, Trash2, X, Pencil, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface Banner {
  id: number
  name: string
  position: string
  is_active: boolean | null
  images?: string[]
  created_at?: string
}

export default function BannersPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createPosition, setCreatePosition] = useState('')
  const [createActive, setCreateActive] = useState(true)
  const [createFiles, setCreateFiles] = useState<FileList | null>(null)
  const [creating, setCreating] = useState(false)

  // Edit
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPosition, setEditPosition] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editFiles, setEditFiles] = useState<FileList | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const authHeader = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${BASE}/api/banners`, { headers: { ...authHeader, Accept: 'application/json' } })
      .then(r => r.json())
      .then(json => {
        const raw = json?.data?.data ?? json?.data ?? json
        setBanners(Array.isArray(raw) ? raw : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  async function handleCreate() {
    if (!createName.trim() || !createPosition.trim()) return
    setCreating(true)
    const fd = new FormData()
    fd.append('name', createName)
    fd.append('position', createPosition)
    fd.append('is_active', createActive ? '1' : '0')
    if (createFiles) Array.from(createFiles).forEach(f => fd.append('images[]', f))
    const res = await fetch(`${BASE}/api/banners`, { method: 'POST', headers: authHeader, body: fd })
    const json = await res.json()
    if (res.ok) {
      setBanners(p => [...p, json.data || json])
      setShowCreate(false); setCreateName(''); setCreatePosition(''); setCreateFiles(null)
    } else setError(json.message || 'Failed to create.')
    setCreating(false)
  }

  async function handleSave(id: number) {
    setSaving(true)
    const fd = new FormData()
    fd.append('name', editName)
    fd.append('position', editPosition)
    fd.append('is_active', editActive ? '1' : '0')
    if (editFiles) Array.from(editFiles).forEach(f => fd.append('images[]', f))
    const res = await fetch(`${BASE}/api/banners/${id}`, { method: 'POST', headers: authHeader, body: fd })
    const json = await res.json()
    if (res.ok) { setBanners(p => p.map(b => b.id === id ? { ...b, ...json.data } : b)); setEditId(null) }
    else setError(json.message || 'Failed to update.')
    setSaving(false)
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    const res = await fetch(`${BASE}/api/banners/${id}`, { method: 'DELETE', headers: authHeader })
    if (res.ok) { setBanners(p => p.filter(b => b.id !== id)); setDeleteId(null) }
    else setError('Failed to delete.')
    setDeleting(false)
  }

  function startEdit(b: Banner) {
    setEditId(b.id); setEditName(b.name); setEditPosition(b.position); setEditActive(b.is_active ?? true); setEditFiles(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ImageIcon size={20} className="text-orange-500" /> Banners</h1>
          <p className="text-sm text-gray-400 mt-0.5">{banners.length} banners total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Add Banner
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}

      {/* Create form */}
      {showCreate && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">New Banner</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Name *" value={createName} onChange={e => setCreateName(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400" />
            <input type="text" placeholder="Position * (e.g. hero, sidebar)" value={createPosition} onChange={e => setCreatePosition(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400" />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={createActive} onChange={e => setCreateActive(e.target.checked)} className="accent-orange-500" />
              Active
            </label>
            <div className="flex-1">
              <input type="file" multiple accept="image/*" onChange={e => setCreateFiles(e.target.files)} className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating || !createName.trim() || !createPosition.trim()} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg">{creating ? 'Creating…' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 px-3 py-2"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Banners grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">No banners yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Image preview */}
              <div className="relative h-36 bg-gray-50">
                {b.images?.[0] ? (
                  <img src={getImageUrl(b.images[0])} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                )}
                <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-3">
                {editId === b.id ? (
                  <div className="space-y-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full text-sm border border-orange-300 rounded-lg px-2 py-1.5 outline-none" placeholder="Name" />
                    <input value={editPosition} onChange={e => setEditPosition(e.target.value)} className="w-full text-sm border border-orange-300 rounded-lg px-2 py-1.5 outline-none" placeholder="Position" />
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)} className="accent-orange-500" /> Active
                    </label>
                    <input type="file" multiple accept="image/*" onChange={e => setEditFiles(e.target.files)} className="text-xs text-gray-500 w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600" />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleSave(b.id)} disabled={saving} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg"><Check size={12} /> {saving ? 'Saving…' : 'Save'}</button>
                      <button onClick={() => setEditId(null)} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg"><X size={12} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{b.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Position: <span className="font-mono">{b.position}</span></p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Banner</h2>
            <p className="text-sm text-gray-500 mb-5">Delete <strong>{banners.find(b => b.id === deleteId)?.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">{deleting ? 'Deleting…' : 'Delete'}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}