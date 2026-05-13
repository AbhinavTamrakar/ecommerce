'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Plus, Pencil, Trash2, X, Check, Sliders, ChevronDown, ChevronRight } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface AttributeValue { id: number; value: string; color_code: string | null }
interface Attribute { id: number; name: string; created_at: string | null; values?: AttributeValue[] }

export default function AttributesPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

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

  async function load() {
    setLoading(true)
    const res = await fetch(`${BASE}/api/attributes`, { headers: h })
    const json = await res.json()
    const raw = json?.data?.data ?? json?.data ?? json
    setAttributes(Array.isArray(raw) ? raw : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [token])

  async function handleCreate() {
    if (!createName.trim()) return
    setCreating(true)
    const res = await fetch(`${BASE}/api/attributes`, { method: 'POST', headers: h, body: JSON.stringify({ name: createName }) })
    const json = await res.json()
    if (res.ok) { setAttributes(p => [...p, { ...json.data, values: [] }]); setCreateName(''); setShowCreate(false) }
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Sliders size={20} className="text-orange-500" /> Attributes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{attributes.length} attributes total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Add Attribute
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}

      {showCreate && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex gap-3">
          <input type="text" placeholder="Attribute name *" value={createName} onChange={e => setCreateName(e.target.value)} className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400" />
          <button onClick={handleCreate} disabled={creating || !createName.trim()} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg">{creating ? 'Creating…' : 'Create'}</button>
          <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 px-2"><X size={16} /></button>
        </div>
      )}

      <div className="space-y-2">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />) :
          attributes.map(attr => (
            <div key={attr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpanded(expanded === attr.id ? null : attr.id)} className="text-gray-400 hover:text-gray-600">
                  {expanded === attr.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {editId === attr.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 text-sm border border-orange-300 rounded px-2 py-1 outline-none" autoFocus />
                ) : (
                  <span className="flex-1 font-medium text-gray-800">{attr.name}</span>
                )}
                <span className="text-xs text-gray-400 mr-2">{attr.values?.length ?? 0} values</span>
                <div className="flex gap-1">
                  {editId === attr.id ? (
                    <>
                      <button onClick={() => handleSave(attr.id)} disabled={saving} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check size={14} /></button>
                      <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(attr.id); setEditName(attr.name) }} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(attr.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>

              {expanded === attr.id && (
                <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/50">
                  <div className="space-y-2 mb-3">
                    {(attr.values || []).map(v => (
                      <div key={v.id} className="flex items-center gap-3">
                        {v.color_code && <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ background: v.color_code }} />}
                        {editValueId === v.id ? (
                          <>
                            <input value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 text-sm border border-orange-300 rounded px-2 py-1 outline-none" />
                            <input value={editColorCode} onChange={e => setEditColorCode(e.target.value)} placeholder="#hex" className="w-20 text-sm border border-gray-200 rounded px-2 py-1 outline-none font-mono" />
                            <button onClick={() => handleSaveValue(v.id, attr.id)} className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100"><Check size={13} /></button>
                            <button onClick={() => setEditValueId(null)} className="p-1 rounded bg-gray-100 text-gray-500"><X size={13} /></button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-gray-700">{v.value}</span>
                            {v.color_code && <span className="text-xs font-mono text-gray-400">{v.color_code}</span>}
                            <button onClick={() => { setEditValueId(v.id); setEditValue(v.value); setEditColorCode(v.color_code || '') }} className="p-1 rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50"><Pencil size={13} /></button>
                            <button onClick={() => handleDeleteValue(v.id, attr.id)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {addValueAttrId === attr.id ? (
                    <div className="flex gap-2">
                      <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Value *" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400" />
                      <input value={newColorCode} onChange={e => setNewColorCode(e.target.value)} placeholder="#hex" className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none font-mono" />
                      <button onClick={() => handleAddValue(attr.id)} disabled={addingValue || !newValue.trim()} className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">{addingValue ? '…' : 'Add'}</button>
                      <button onClick={() => setAddValueAttrId(null)} className="text-gray-400 px-1"><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setAddValueAttrId(attr.id)} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
                      <Plus size={13} /> Add value
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        }
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Attribute</h2>
            <p className="text-sm text-gray-500 mb-5">Delete <strong>{attributes.find(a => a.id === deleteId)?.name}</strong> and all its values?</p>
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