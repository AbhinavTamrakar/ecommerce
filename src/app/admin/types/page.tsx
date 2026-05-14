'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Plus, Pencil, Trash2, X, Check, Layers } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface Type {
  id: number
  name: string
  slug: string | null
  created_at: string | null
  updated_at: string | null
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function TypesPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }

  async function fetchTypes(p = 1, limit = 10) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/types?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, { headers })
      const json = await res.json()
      const raw = json?.data?.data ?? json?.data ?? json
      const lastPage = json?.data?.last_page || 0
      
      setTypes(Array.isArray(raw) ? raw : [])
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(json?.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setError('Failed to load types.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTypes(page, pageSize) }, [token, page, pageSize])

  async function handleCreate() {
    if (!createName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${BASE}/api/types`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: createName, slug: createSlug || slugify(createName) }),
      })
      const json = await res.json()
      if (res.ok) {
        fetchTypes(page, pageSize)
        setCreateName('')
        setCreateSlug('')
        setShowCreate(false)
      } else {
        setError(json.message || 'Failed to create type.')
      }
    } finally {
      setCreating(false)
    }
  }

  function startEdit(type: Type) {
    setEditId(type.id)
    setEditName(type.name)
    setEditSlug(type.slug || '')
  }

  async function handleSave(id: number) {
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/api/types/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: editName, slug: editSlug || slugify(editName) }),
      })
      const json = await res.json()
      if (res.ok) {
        setTypes((prev) => prev.map((t) => (t.id === id ? json.data : t)))
        setEditId(null)
      } else {
        setError(json.message || 'Failed to update type.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const res = await fetch(`${BASE}/api/types/${id}`, { method: 'DELETE', headers })
      if (res.ok) {
        setTypes((prev) => prev.filter((t) => t.id !== id))
        setDeleteId(null)
      } else {
        const json = await res.json()
        setError(json.message || 'Failed to delete type.')
      }
    } finally {
      setDeleting(false)
    }
  }

  const displayData = isServerPaginated 
    ? types.slice(0, pageSize) 
    : types.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-2xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
               <Layers size={22} className="text-black" /> 
            </div>
            Catalog Types
          </h1>
          <p className="text-sm text-black mt-1 uppercase tracking-wider ml-1">Universal Classification Registry</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateName(''); setCreateSlug('') }}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[11px] font-bold uppercase tracking-[0.1em] px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> New Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-5 py-4 rounded-2xl mb-6 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-[#96b1d8]/30 rounded-[2rem] p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-in zoom-in-95 duration-200">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Type Label *</label>
            <input
              type="text"
              placeholder="e.g. Menswear"
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value)
                setCreateSlug(slugify(e.target.value))
              }}
              className="w-full text-sm font-bold border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-[#96b1d8] transition-all"
            />
          </div>
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Public Slug (auto)</label>
            <input
              type="text"
              placeholder="mens-wear"
              value={createSlug}
              onChange={(e) => setCreateSlug(e.target.value)}
              className="w-full text-sm font-mono border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-[#96b1d8] bg-gray-50/50"
            />
          </div>
          <div className="flex gap-2 mb-[2px]">
            <button
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
              className="bg-[#96b1d8] hover:bg-[#86a1c8] disabled:opacity-50 text-black text-[11px] font-bold uppercase tracking-widest px-8 py-3.5 rounded-2xl transition-all shadow-md active:scale-95"
            >
              {creating ? 'Saving…' : 'Create Type'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="bg-gray-100 hover:bg-gray-200 text-black text-[11px] font-bold uppercase tracking-widest px-4 py-3.5 rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">S.N</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Label</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Slug</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Created</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && types.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-full w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                       <Layers size={48} />
                       <p className="text-xs font-bold uppercase tracking-widest">No types available</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((type, idx) => (
                  <tr key={type.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-5 text-black font-black text-[10px]">
                       {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-5">
                      {editId === type.id ? (
                        <input
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value)
                            setEditSlug(slugify(e.target.value))
                          }}
                          className="text-sm font-bold border border-[#96b1d8] rounded-xl px-4 py-2 outline-none w-full shadow-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-bold text-black text-[15px]">{type.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {editId === type.id ? (
                        <input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="text-sm font-mono border border-[#96b1d8] rounded-xl px-4 py-2 outline-none w-full shadow-sm"
                        />
                      ) : (
                        <span className="font-bold text-[11px] text-[#96b1d8] bg-[#96b1d8]/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                           {type.slug || '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-black/80 uppercase tracking-widest">
                      {type.created_at ? new Date(type.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editId === type.id ? (
                          <>
                            <button
                              onClick={() => handleSave(type.id)}
                              disabled={saving}
                              className="p-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-all shadow-sm"
                              title="Update"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-2.5 rounded-xl bg-gray-50 text-black/80 hover:text-black transition-all"
                              title="Discard"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(type)}
                              className="p-2.5 rounded-xl text-black/80 hover:text-[#96b1d8] hover:bg-[#96b1d8]/5 transition-all outline-none"
                              title="Modify Type"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteId(type.id)}
                              className="p-2.5 rounded-xl text-black/80 hover:text-red-500 hover:bg-red-50 transition-all outline-none"
                              title="Delete Type"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 0 && (
          <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/10">
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
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
               <Trash2 size={28} />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Remove Type?</h2>
            <p className="text-sm font-medium text-black/90 mb-8 leading-relaxed">
              Are you sure you want to delete <strong className="text-black font-bold uppercase tracking-tighter">"{types.find(t => t.id === deleteId)?.name}"</strong>? This will impact all linked products.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/20"
              >
                {deleting ? 'Removing…' : 'Delete Now'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-black text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-2xl transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}