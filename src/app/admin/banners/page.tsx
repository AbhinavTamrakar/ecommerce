'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Image as ImageIcon, Plus, Trash2, X, Pencil, Check } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import Pagination from '@/components/admin/Pagination'

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

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

  async function fetchBanners(p: number, limit = 6) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/banners?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, { 
        headers: { ...authHeader, Accept: 'application/json' } 
      })
      const json = await res.json()
      const raw = json?.data?.data ?? json?.data ?? json
      const lastPage = json?.data?.last_page || 0

      setBanners(Array.isArray(raw) ? raw : [])

      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(json?.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) fetchBanners(page, pageSize) }, [token, page, pageSize])

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
      fetchBanners(page, pageSize)
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
    if (res.ok) { fetchBanners(page, pageSize); setEditId(null) }
    else setError(json.message || 'Failed to update.')
    setSaving(false)
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    const res = await fetch(`${BASE}/api/banners/${id}`, { method: 'DELETE', headers: authHeader })
    if (res.ok) { fetchBanners(page, pageSize); setDeleteId(null) }
    else setError('Failed to delete.')
    setDeleting(false)
  }

  function startEdit(b: Banner) {
    setEditId(b.id); setEditName(b.name); setEditPosition(b.position); setEditActive(b.is_active ?? true); setEditFiles(null)
  }

  const displayData = isServerPaginated 
    ? banners.slice(0, pageSize) 
    : banners.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black pb-24">
      <div className="flex items-center justify-between mb-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
               <ImageIcon size={22} className="text-black" /> 
            </div>
            Display Vault
          </h1>
          <p className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-[0.3em] ml-1">Creative Asset Registry</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} /> Deploy New
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-8 py-6 rounded-[2rem] mb-12 flex items-center justify-between shadow-sm animate-in slide-in-from-top-4">
          <span className="font-bold tracking-tight">{error}</span>
          <button onClick={() => setError('')} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-red-100 transition-colors"><X size={18} /></button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-[#96b1d8]/30 rounded-[3rem] p-10 mb-12 shadow-2xl animate-in zoom-in-95 duration-300">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black/20 mb-8 ml-1">Manifest New Visual Unit</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Asset Alias *</label>
              <input type="text" placeholder="e.g. Autumnal Pivot" value={createName} onChange={e => setCreateName(e.target.value)} className="w-full text-sm font-bold border border-gray-100 rounded-[1.5rem] px-6 py-5 outline-none focus:border-[#96b1d8] transition-all bg-gray-50/50" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Spatial Index *</label>
              <input type="text" placeholder="e.g. HERO_ALPHA" value={createPosition} onChange={e => setCreatePosition(e.target.value)} className="w-full text-sm font-black border border-gray-100 rounded-[1.5rem] px-6 py-5 outline-none focus:border-[#96b1d8] transition-all bg-gray-50/50 uppercase tracking-widest" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-10 mb-10 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
            <label className="flex items-center gap-4 text-[11px] font-black text-black uppercase tracking-[0.2em] cursor-pointer group">
              <input type="checkbox" checked={createActive} onChange={e => setCreateActive(e.target.checked)} className="w-6 h-6 rounded-xl border-gray-200 accent-black transition-all shadow-sm" />
              <span className="group-hover:text-[#96b1d8] transition-colors">Immediate Broadcast</span>
            </label>
            <div className="flex-1 min-w-[280px]">
              <input type="file" multiple accept="image/*" onChange={e => setCreateFiles(e.target.files)} className="text-[10px] text-black/30 font-bold uppercase w-full file:mr-8 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-black file:text-white hover:file:bg-[#96b1d8] transition-all cursor-pointer shadow-sm" />
            </div>
          </div>
          <div className="flex gap-4 pt-8 border-t border-gray-50">
            <button onClick={handleCreate} disabled={creating || !createName.trim() || !createPosition.trim()} className="bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest text-[11px] px-10 py-5 rounded-[1.5rem] transition-all disabled:opacity-50 shadow-2xl shadow-black/20 active:scale-95">{creating ? 'Processing manifest…' : 'Finalize Deployment'}</button>
            <button onClick={() => setShowCreate(false)} className="text-black/30 hover:text-black px-8 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-gray-100">Discard Manifest</button>
          </div>
        </div>
      )}

      {/* Banners grid */}
      <div className="mb-16">
        {loading && banners.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 bg-gray-50 rounded-[3rem] animate-pulse border border-gray-100" />)}
          </div>
        ) : displayData.length === 0 ? (
          <div className="bg-white rounded-[4rem] border border-gray-100 p-40 text-center text-black/10 flex flex-col items-center gap-8 shadow-sm">
            <ImageIcon size={80} className="stroke-[1px]" />
            <p className="font-black uppercase tracking-[0.5em] text-[10px]">Registry Clean</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayData.map(b => (
              <div key={b.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:border-[#96b1d8]/50 transition-all duration-700">
                {/* Image preview */}
                <div className="relative h-64 bg-gray-50 overflow-hidden">
                  {b.images?.[0] ? (
                    <img src={getImageUrl(b.images[0])} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/5 opacity-20"><ImageIcon size={64} strokeWidth={1} /></div>
                  )}
                  <div className="absolute top-6 right-6 flex items-center">
                     <span className={`text-[10px] px-4 py-2 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/20 transition-all ${b.is_active ? 'bg-black text-white' : 'bg-white text-black/20'}`}>
                      {b.is_active ? 'Streaming' : 'Internal'}
                    </span>
                  </div>
                </div>

                <div className="p-10">
                  {editId === b.id ? (
                    <div className="space-y-5">
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full text-base font-black border-b-2 border-black pb-2 outline-none bg-transparent" placeholder="Name" />
                      <input value={editPosition} onChange={e => setEditPosition(e.target.value)} className="w-full text-[11px] font-black border-b-2 border-black/10 pb-2 outline-none bg-transparent uppercase tracking-widest text-[#96b1d8]" placeholder="Position" />
                      <div className="flex items-center justify-between py-4">
                         <label className="flex items-center gap-4 text-[11px] font-black text-black uppercase tracking-widest cursor-pointer">
                          <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)} className="w-6 h-6 rounded-xl accent-black" /> Live
                        </label>
                        <input type="file" multiple accept="image/*" onChange={e => setEditFiles(e.target.files)} className="text-[9px] text-black/20 w-36 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-gray-100 file:text-[9px] file:font-black file:uppercase file:tracking-tighter" />
                      </div>
                      <div className="flex gap-3 pt-6 border-t border-gray-50">
                        <button onClick={() => handleSave(b.id)} disabled={saving} className="flex-1 flex items-center justify-center gap-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest py-4.5 rounded-2xl shadow-xl shadow-black/20 transition-all active:scale-95"><Check size={16} /> {saving ? 'Syncing…' : 'Commit'}</button>
                        <button onClick={() => setEditId(null)} className="flex-1 flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-black/30 text-[10px] font-black uppercase tracking-widest py-4.5 rounded-2xl transition-all">Abort</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-black text-xl tracking-tighter truncate pr-4 group-hover:text-[#96b1d8] transition-colors leading-none">{b.name}</p>
                        <div className="flex items-center gap-3 mt-4">
                           <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Locator:</span>
                           <span className="text-[10px] font-black text-black/40 bg-gray-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-500">{b.position}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-col">
                        <button onClick={() => startEdit(b)} className="p-4 rounded-2xl text-black/20 hover:text-black hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md" title="Modify asset"><Pencil size={20} /></button>
                        <button onClick={() => setDeleteId(b.id)} className="p-4 rounded-2xl text-black/20 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-md" title="Extract asset"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 0 && (
        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
           <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(page);
              }}
            />
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-[4rem] shadow-2xl p-14 max-w-sm w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-10 border-4 border-white shadow-2xl shadow-red-500/10">
               <Trash2 size={32} />
            </div>
            <h2 className="text-3xl font-black text-black mb-3 tracking-tighter leading-none">Extract Asset?</h2>
            <p className="text-[11px] font-black text-black/20 mb-12 leading-relaxed uppercase tracking-[0.3em]">
              The creative manifest <span className="text-black/50">"{banners.find(b => b.id === deleteId)?.name}"</span> will be purged from the cluster.
            </p>
            <div className="flex gap-4">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-[2] bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-[0.15em] py-5 rounded-[2rem] transition-all shadow-2xl shadow-red-500/30 active:scale-95 h-16">{deleting ? 'Liquidating…' : 'Confirm Wipe'}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black/30 text-[11px] font-black uppercase tracking-[0.15em] py-5 rounded-[2rem] transition-all h-16">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}