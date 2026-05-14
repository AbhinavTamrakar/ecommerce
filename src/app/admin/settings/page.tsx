'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Settings, Save, X } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface SettingData {
  id?: number
  name?: string | null
  logo?: string | null
  email?: string | null
  address?: string | null
  about?: string | null
  header_logo?: string | null
  footer_logo?: string | null
  map_iframe?: string | null
  phone?: string[] | null
}

export default function SettingsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [settings, setSettings] = useState<SettingData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [phoneInput, setPhoneInput] = useState('')

  const h = { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${BASE}/api/public/settings`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        const d = json.data || json
        setSettings(d)
        setPhoneInput(Array.isArray(d.phone) ? d.phone.join(', ') : d.phone || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    const phones = phoneInput.split(',').map(p => p.trim()).filter(Boolean)
    const body = { ...settings, phone: phones }
    const isNew = !settings.id
    const res = await fetch(`${BASE}/api/settings`, {
      method: isNew ? 'POST' : 'PUT',
      headers: h,
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (res.ok) {
      setSettings(json.data || json)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(json.message || 'Failed to save settings.')
    }
    setSaving(false)
  }

  const field = (label: string, key: keyof SettingData, type: 'text' | 'email' | 'textarea' = 'text') => (
    <div key={key}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={(settings[key] as string) || ''}
          onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
          rows={4}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 resize-none"
        />
      ) : (
        <input
          type={type}
          value={(settings[key] as string) || ''}
          onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"
        />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Settings size={20} className="text-orange-500" /> Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Store information and configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">Settings saved successfully.</div>}

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

          <div className="pb-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">General</p>
            <div className="space-y-4">
              {field('Store Name', 'name')}
              {field('Email', 'email', 'email')}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Numbers</label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="e.g. +977-123, +977-456 (comma separated)"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"
                />
              </div>
              {field('Address', 'address')}
              {field('About', 'about', 'textarea')}
            </div>
          </div>

          <div className="pb-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Branding</p>
            <div className="space-y-4">
              {field('Logo URL', 'logo')}
              {field('Header Logo URL', 'header_logo')}
              {field('Footer Logo URL', 'footer_logo')}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Map</p>
            {field('Map iFrame URL', 'map_iframe', 'textarea')}
          </div>

        </div>
      )}
    </div>
  )
}