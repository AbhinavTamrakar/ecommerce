'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Plus, Pencil, Trash2, X, Check, Sliders, ChevronDown, ChevronRight } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface AttributeValue { id: number; value: string; color_code: string | null }
interface Attribute { id: number; name: string; created_at: string | null; values?: AttributeValue[] }

export default function AttributesPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  // Attribute CRUD
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Value CRUD
  const [addValueAttrId, setAddValueAttrId] = useState<number | null>(null)
  const [newValue, setNewValue] = useState('')
  const [newColorCode, setNewColorCode] = useState('')
  const [addingValue, setAddingValue] = useState(false)
  const [editValueId, setEditValueId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editColorCode, setEditColorCode] = useState('')
  const [deleteValueId, setDeleteValueId] = useState<number | null>(null)

  const h = { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }

  async function load(p = 1, limit = 10) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/attributes?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, { headers: h })
      const json = await res.json()
      const raw = json?.data?.data ?? json?.data ?? json
      const lastPage = json?.data?.last_page || 0
      
      setAttributes(Array.isArray(raw) ? raw : [])
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(json?.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) load(page, pageSize) }, [token, page, pageSize])

  async function handleCreate() {
    if (!createName.trim()) return
    setCreating(true)
    const res = await fetch(`${BASE}/api/attributes`, { method: 'POST', headers: h, body: JSON.stringify({ name: createName }) })
    const json = await res.json()
    if (res.ok) { load(page, pageSize); setCreateName(''); setShowCreate(false) }
    else setError(json.message || 'Failed')
    setCreating(false)
  }

  async function handleSave(id: number) {
    setSaving(true)
    const res = await fetch(`${BASE}/api/attributes/${id}`, { method: 'PUT', headers: h, body: JSON.stringify({ name: editName }) })
    const json = await res.json()
    if (res.ok) { setAttributes(p => p.map(a => a.id === id ? { ...a, name: json.data?.name || editName } : a)); setEditId(null) }
    else setError(json.message || 'Failed')
    setSaving(false)
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    const res = await fetch(`${BASE}/api/attributes/${id}`, { method: 'DELETE', headers: h })
    if (res.ok) { setAttributes(p => p.filter(a => a.id !== id)); setDeleteId(null) }
    setDeleting(false)
  }

  async function handleAddValue(attrId: number) {
    if (!newValue.trim()) return
    setAddingValue(true)
    const res = await fetch(`${BASE}/api/attributes/${attrId}/values`, { method: 'POST', headers: h, body: JSON.stringify({ value: newValue, color_code: newColorCode || null }) })
    const json = await res.json()
    if (res.ok) {
      setAttributes(p => p.map(a => a.id === attrId ? { ...a, values: [...(a.values || []), json.data] } : a))
      setNewValue(''); setNewColorCode(''); setAddValueAttrId(null)
    } else setError(json.message || 'Failed')
    setAddingValue(false)
  }

  async function handleSaveValue(valueId: number, attrId: number) {
    const res = await fetch(`${BASE}/api/attribute-values/${valueId}`, { method: 'PUT', headers: h, body: JSON.stringify({ value: editValue, color_code: editColorCode || null }) })
    const json = await res.json()
    if (res.ok) {
      setAttributes(p => p.map(a => a.id === attrId ? { ...a, values: (a.values || []).map(v => v.id === valueId ? { ...v, value: editValue, color_code: editColorCode || null } : v) } : a))
      setEditValueId(null)
    } else setError(json.message || 'Failed')
  }

  async function handleDeleteValue(valueId: number, attrId: number) {
    const res = await fetch(`${BASE}/api/attribute-values/${valueId}`, { method: 'DELETE', headers: h })
    if (res.ok) setAttributes(p => p.map(a => a.id === attrId ? { ...a, values: (a.values || []).filter(v => v.id !== valueId) } : a))
    setDeleteValueId(null)
  }

  const displayData = isServerPaginated 
    ? attributes.slice(0, pageSize) 
    : attributes.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 text-black pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <Sliders size={22} className="text-[#96b1d8]" /> 
             </div>
             Attributes
          </h1>
          <p className="text-[10px] font-bold text-black/80 mt-1 uppercase tracking-[0.3em] ml-1">Variation Schema Registry</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> New Attribute
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-6 py-5 rounded-3xl mb-8 flex items-center justify-between animate-in slide-in-from-top-2 shadow-sm">
          <span className="font-bold tracking-tight">{error}</span>
          <button onClick={() => setError('')} className="p-2 bg-white rounded-xl shadow-sm hover:bg-red-100 transition-colors"><X size={16} /></button>
        </div>
      )}

      {showCreate && (
        <div className="bg-white border border-[#96b1d8]/30 rounded-[2.5rem] p-8 mb-10 shadow-sm animate-in zoom-in-95 duration-200">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-black mb-6">Initialize New Descriptor Node</p>
          <div className="flex gap-4 items-center">
            <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Attribute Name *</label>
               <input type="text" placeholder="e.g. Fabric Composition" value={createName} onChange={e => setCreateName(e.target.value)} className="w-full text-sm font-bold border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#96b1d8] transition-all bg-gray-50/50" />
            </div>
            <div className="flex gap-3 self-end mb-0.5">
               <button onClick={handleCreate} disabled={creating || !createName.trim()} className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest px-8 py-4.5 rounded-2xl transition-all shadow-xl shadow-black/10">{creating ? '…' : 'Manifest'}</button>
               <button onClick={() => setShowCreate(false)} className="bg-gray-50 hover:bg-gray-100 text-black p-4.5 rounded-2xl transition-all"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 mb-12">
        {loading && attributes.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-[2.5rem] animate-pulse border border-gray-100" />)
        ) : displayData.length === 0 ? (
          <div className="py-32 text-center opacity-70 flex flex-col items-center gap-6">
             <Sliders size={64} strokeWidth={1} />
             <p className="text-xs font-black uppercase tracking-[0.4em]">Registry Empty</p>
          </div>
        ) : (
          displayData.map(attr => (
            <div key={attr.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-[#96b1d8] transition-all duration-500">
              <div className="flex items-center gap-6 px-8 py-6">
                <button 
                  onClick={() => setExpanded(expanded === attr.id ? null : attr.id)} 
                  className={`p-3 rounded-2xl transition-all ${expanded === attr.id ? 'bg-[#96b1d8] text-white shadow-xl shadow-[#96b1d8]/30' : 'text-black hover:text-black hover:bg-gray-50'}`}
                >
                  {expanded === attr.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {editId === attr.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 text-base font-black border-b-2 border-[#96b1d8] pb-1 outline-none bg-transparent" autoFocus />
                ) : (
                  <div className="flex-1">
                     <span className="font-black text-black text-xl tracking-tighter leading-none block">{attr.name}</span>
                     <span className="text-[10px] font-bold text-black uppercase tracking-[0.2em] mt-2 block">{attr.values?.length ?? 0} active selections</span>
                  </div>
                )}
                <div className="flex gap-1">
                  {editId === attr.id ? (
                    <>
                      <button onClick={() => handleSave(attr.id)} disabled={saving} className="p-3.5 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all shadow-lg active:scale-95"><Check size={18} /></button>
                      <button onClick={() => setEditId(null)} className="p-3.5 rounded-2xl bg-gray-50 text-black hover:text-black transition-all"><X size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(attr.id); setEditName(attr.name) }} className="p-3 rounded-2xl text-black/80 hover:text-[#96b1d8] hover:bg-white transition-all outline-none" title="Modify descriptor"><Pencil size={18} /></button>
                      <button onClick={() => setDeleteId(attr.id)} className="p-3 rounded-2xl text-black/80 hover:text-red-500 hover:bg-red-50 transition-all outline-none" title="Extract descriptor"><Trash2 size={18} /></button>
                    </>
                  )}
                </div>
              </div>

              {expanded === attr.id && (
                <div className="border-t border-gray-50 px-12 py-10 bg-gray-50/30 animate-in slide-in-from-top-6 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {(attr.values || []).map(v => (
                      <div key={v.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group/val transition-all hover:shadow-lg">
                        {v.color_code && <span className="w-8 h-8 rounded-xl border border-white shadow-xl shrink-0" style={{ background: v.color_code }} />}
                        {editValueId === v.id ? (
                          <div className="flex-1 flex gap-2">
                            <input value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 text-sm font-bold border-b-2 border-[#96b1d8] pb-0.5 outline-none bg-transparent" />
                            <button onClick={() => handleSaveValue(v.id, attr.id)} className="p-2.5 rounded-xl bg-black text-white"><Check size={14} /></button>
                            <button onClick={() => setEditValueId(null)} className="p-2.5 rounded-xl bg-gray-100 text-black/80"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-black text-base leading-none group-hover/val:text-[#96b1d8] transition-colors truncate">{v.value}</p>
                               {v.color_code && <p className="text-[9px] font-mono font-bold text-black uppercase tracking-widest mt-1.5">{v.color_code}</p>}
                            </div>
                            <button onClick={() => { setEditValueId(v.id); setEditValue(v.value); setEditColorCode(v.color_code || '') }} className="p-2.5 rounded-xl text-black hover:text-black hover:bg-gray-100 transition-all opacity-0 group-hover/val:opacity-700"><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteValue(v.id, attr.id)} className="p-2.5 rounded-xl text-black hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/val:opacity-700"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {addValueAttrId === attr.id ? (
                    <div className="bg-white p-6 rounded-[2.5rem] border border-[#96b1d8]/30 shadow-2xl animate-in zoom-in-95 space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black ml-2">Append New Variation Option</p>
                      <div className="flex gap-3">
                         <input autoFocus value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Entry Label *" className="flex-1 text-sm font-bold border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#96b1d8] bg-gray-50/50" />
                         <input value={newColorCode} onChange={e => setNewColorCode(e.target.value)} placeholder="#hex" className="w-28 text-sm font-mono border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#96b1d8] bg-gray-50/50" />
                         <button onClick={() => handleAddValue(attr.id)} disabled={addingValue || !newValue.trim()} className="bg-black hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl disabled:opacity-50 shadow-xl shadow-black/20 active:scale-95 transition-all">{addingValue ? '…' : 'Finalize'}</button>
                      </div>
                      <button onClick={() => setAddValueAttrId(null)} className="w-full py-3 text-[10px] font-black text-black hover:text-black uppercase tracking-[0.2em] transition-all">Cancel Entry</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddValueAttrId(attr.id)} className="flex items-center gap-3 text-[11px] font-black text-black/70 hover:text-[#96b1d8] uppercase tracking-[0.3em] transition-all px-8 py-4 rounded-2xl hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-50">
                      <Plus size={16} strokeWidth={4} /> Append Option
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!loading && totalPages > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
           <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-[3.5rem] shadow-2xl p-12 max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mb-8 border-4 border-white shadow-xl shadow-red-500/10">
               <Trash2 size={28} />
            </div>
            <h2 className="text-2xl font-black text-black mb-2 tracking-tighter leading-none">Strip Node?</h2>
            <p className="text-[10px] font-black text-black mb-10 leading-relaxed uppercase tracking-[0.3em]">
              The schema <span className="text-black/90">"{attributes.find(a => a.id === deleteId)?.name}"</span> will be purged from the cluster.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-[2] bg-red-500 hover:bg-red-600 font-black uppercase tracking-widest text-[11px] py-4.5 rounded-3xl text-white shadow-2xl shadow-red-500/30 h-14">{deleting ? 'Purging…' : 'Confirm Wipe'}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black text-[11px] font-black uppercase tracking-widest py-4.5 rounded-3xl transition-all h-14">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}