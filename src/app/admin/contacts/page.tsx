'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Mail, Trash2, X, Eye } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface Contact {
  id: number
  full_name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
  created_at?: string
}

export default function ContactsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const h = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${BASE}/api/contacts`, { headers: h })
      .then(r => r.json())
      .then(json => {
        const raw = json?.data?.data ?? json?.data ?? json
        setContacts(Array.isArray(raw) ? raw : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  async function handleDelete(id: number) {
    setDeleting(true)
    const res = await fetch(`${BASE}/api/contacts/${id}`, { method: 'DELETE', headers: h })
    if (res.ok) { setContacts(p => p.filter(c => c.id !== id)); setDeleteId(null); if (selected?.id === id) setSelected(null) }
    else setError('Failed to delete.')
    setDeleting(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Mail size={20} className="text-orange-500" /> Contacts</h1>
        <p className="text-sm text-gray-400 mt-0.5">{contacts.length} messages total</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Name', 'Email', 'Subject', 'Phone', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded" /></td>)}</tr>
            )) : contacts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No contact messages yet.</td></tr>
            ) : contacts.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.email}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{c.subject || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50"><Eye size={14} /></button>
                    <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Message from {selected.full_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[['Email', selected.email], ['Phone', selected.phone || '—'], ['Subject', selected.subject || '—']].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-gray-400 mb-2">Message</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">{selected.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Message</h2>
            <p className="text-sm text-gray-500 mb-5">Delete this message from <strong>{contacts.find(c => c.id === deleteId)?.full_name}</strong>?</p>
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