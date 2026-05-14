'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Plus, Pencil, Trash2, X, Check, Layers } from 'lucide-react'

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

  async function fetchTypes() {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/types`, { headers })
      const json = await res.json()
      const raw = json?.data?.data ?? json?.data ?? json
      setTypes(Array.isArray(raw) ? raw : [])
    } catch {
      setError('Failed to load types.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTypes() }, [token])

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
        setTypes((prev) => [...prev, json.data])
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers size={20} className="text-orange-500" /> Types
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{types.length} types total</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateName(''); setCreateSlug('') }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">New Type</p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Name *"
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value)
                setCreateSlug(slugify(e.target.value))
              }}
              className="flex-1 min-w-[140px] text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"
            />
            <input
              type="text"
              placeholder="Slug (auto)"
              value={createSlug}
              onChange={(e) => setCreateSlug(e.target.value)}
              className="flex-1 min-w-[140px] text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 font-mono"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-gray-400 hover:text-gray-600 px-2 py-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : types.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No types yet. Click "Add Type" to create one.
                </td>
              </tr>
            ) : (
              types.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{type.id}</td>
                  <td className="px-4 py-3">
                    {editId === type.id ? (
                      <input
                        value={editName}
                        onChange={(e) => {
                          setEditName(e.target.value)
                          setEditSlug(slugify(e.target.value))
                        }}
                        className="text-sm border border-orange-300 rounded px-2 py-1 outline-none w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{type.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === type.id ? (
                      <input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="text-sm border border-orange-300 rounded px-2 py-1 outline-none font-mono w-full"
                      />
                    ) : (
                      <span className="font-mono text-xs text-gray-500">{type.slug || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {type.created_at ? new Date(type.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editId === type.id ? (
                        <>
                          <button
                            onClick={() => handleSave(type.id)}
                            disabled={saving}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(type)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(type.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Type</h2>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete <strong>{types.find(t => t.id === deleteId)?.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}