'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Settings, Globe, Share2, Link as LinkIcon, CreditCard, 
  Plus, Trash2, Pencil, Check, X, Mail, Phone, MapPin, 
  ChevronUp, ChevronDown, ImageIcon, Save
} from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function AdminSettingsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'quick' | 'payment'>('general')
  const [loading, setLoading] = useState(false)
  
  // Tab-specific states
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [quickLinks, setQuickLinks] = useState<any[]>([])
  const [payments, setPayments] = useState([
    { id: 'paypal', name: 'PayPal', provider: 'PayPal', status: true, icon: '🅿' },
    { id: 'cod', name: 'Cash on Delivery', provider: 'Local', status: true, icon: '💵' },
  ])

  const [businessData, setBusinessData] = useState({
    name: 'ShaktaTech Shop',
    email: 'shaktatech@gmail.com',
    phones: ['9866437014'],
    address: 'Kathmandu Nepal',
    about: 'This is about ShaktaTech Shop.',
    mapsIframe: 'https://www.google.com/maps/embed/...',
    logos: { main: null, header: null, footer: null }
  })

  // CRUD States
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [formName, setFormName] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [processing, setProcessing] = useState(false)

  const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }

  useEffect(() => {
    if (activeTab === 'social') fetchSocials()
    if (activeTab === 'quick') fetchQuicks()
  }, [activeTab, token])

  const fetchSocials = async () => {
    try {
      const res = await fetch(`${BASE}/api/social-links`, { headers: authHeader })
      const data = await res.json()
      setSocialLinks(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []))
    } catch { setSocialLinks([]) }
  }

  const fetchQuicks = async () => {
    try {
      const res = await fetch(`${BASE}/api/quick-links`, { headers: authHeader })
      const data = await res.json()
      setQuickLinks(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []))
    } catch { setQuickLinks([]) }
  }

  const handleSaveItem = async () => {
    if (!formName || !formUrl) return
    setProcessing(true)
    const endpoint = activeTab === 'social' ? 'social-links' : 'quick-links'
    const method = editingItem ? 'PUT' : 'POST'
    const url = editingItem ? `${BASE}/api/${endpoint}/${editingItem.id}` : `${BASE}/api/${endpoint}`
    
    const payload = activeTab === 'social' 
      ? { name: formName, platform: formName, url: formUrl } 
      : { name: formName, url: formUrl }

    try {
      const res = await fetch(url, {
        method,
        headers: authHeader,
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setShowItemModal(false)
        activeTab === 'social' ? fetchSocials() : fetchQuicks()
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure?')) return
    const endpoint = activeTab === 'social' ? 'social-links' : 'quick-links'
    const res = await fetch(`${BASE}/api/${endpoint}/${id}`, { method: 'DELETE', headers: authHeader })
    if (res.ok) activeTab === 'social' ? fetchSocials() : fetchQuicks()
  }

  const handleTogglePayment = (id: string) => {
    setPayments(p => p.map(item => item.id === id ? { ...item, status: !item.status } : item))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'quick', label: 'Quick Links', icon: LinkIcon },
    { id: 'payment', label: 'Payment Details', icon: CreditCard },
  ]

  return (
    <div className="text-black pb-24 max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tighter">Business Settings</h1>
          <p className="text-[10px] font-bold text-black/30 mt-1 uppercase tracking-[0.3em] ml-1">Configuration Control Cluster</p>
        </div>
        {(activeTab === 'social' || activeTab === 'quick') && (
           <button 
             onClick={() => { setEditingItem(null); setFormName(''); setFormUrl(''); setShowItemModal(true); }}
             className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-95"
           >
             <Plus size={18} /> Add New
           </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="bg-gray-100/60 p-2 rounded-[2.5rem] flex items-center mb-12 border border-gray-200/50 shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-3 px-10 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all min-w-[200px] ${
              activeTab === tab.id 
              ? 'bg-white text-black shadow-xl shadow-black/5 ring-1 ring-black/5' 
              : 'text-black/40 hover:text-black'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'text-[#96b1d8]' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
           {/* Company Profile */}
           <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-12 py-10 bg-gray-50/50 border-b border-gray-100 flex items-center gap-6">
                 <div className="p-4 bg-white rounded-2xl shadow-sm text-black"><Globe size={28} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-black leading-none">Company Profile</h2>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-2">Foundational Registry Data</p>
                 </div>
              </div>
              <div className="p-12 space-y-12">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">
                       Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                       <div className="absolute left-7 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors"><Settings size={20} /></div>
                       <input 
                         type="text" 
                         value={businessData.name} 
                         onChange={e => setBusinessData({...businessData, name: e.target.value})}
                         className="w-full bg-gray-50/50 border border-transparent rounded-[1.5rem] px-16 py-5 font-bold text-black focus:bg-white focus:border-black transition-all outline-none"
                       />
                       <div className="absolute right-7 top-1/2 -translate-y-1/2 text-green-500"><Check size={20} /></div>
                    </div>
                 </div>

                 {/* Logos Row */}
                 <div className="space-y-5">
                    <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Company Logotypes</label>
                    <div className="grid grid-cols-3 gap-6">
                        {['logo', 'header', 'footer'].map(type => (
                           <div key={type} className="aspect-[4/3] bg-gray-50 border border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-[#96b1d8] hover:bg-white transition-all cursor-pointer relative overflow-hidden shadow-inner">
                              <ImageIcon size={32} className="text-black/10 group-hover:text-black transition-colors" />
                              <span className="text-[10px] font-black text-black uppercase tracking-widest">{type}</span>
                               <div className="absolute bottom-0 left-0 right-0 h-1 transition-all bg-black group-hover:bg-[#96b1d8]" />
                           </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest text-center">Tap to cycle assets (PNG, JPG up to 2MB)</p>
                 </div>

                 {/* About Business */}
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1 flex items-center gap-2">
                       <LinkIcon size={14} className="text-black/30" /> About Business
                    </label>
                    <div className="relative group">
                       <textarea 
                         value={businessData.about}
                         onChange={e => setBusinessData({...businessData, about: e.target.value})}
                         className="w-full bg-gray-50/50 border border-transparent rounded-[2.5rem] p-10 font-bold text-black text-base focus:bg-white focus:border-black transition-all outline-none resize-none h-44"
                       />
                       <span className="absolute bottom-6 right-8 text-[10px] font-black text-black/20 uppercase tracking-widest">{businessData.about.length}/1000</span>
                    </div>
                 </div>

                 {/* Maps Frame */}
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1 flex items-center gap-2">
                       <MapPin size={14} className="text-black/30" /> Google Maps Embed
                    </label>
                    <div className="relative group">
                       <textarea 
                         readOnly
                         value={businessData.mapsIframe}
                         className="w-full bg-gray-50/30 border border-gray-200 rounded-[1.5rem] px-8 py-6 font-mono text-[10px] font-bold text-black/60 outline-none resize-none h-32"
                       />
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-black/20">
                          <ChevronUp size={20} /><ChevronDown size={20} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Contact Details */}
           <div className="flex flex-col gap-12">
              <div className="bg-gray-50/20 rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                 <div className="px-12 py-10 bg-gray-50/50 border-b border-gray-100 flex items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-black"><Phone size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-black leading-none">Contact Details</h2>
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-2">How customers can reach you</p>
                    </div>
                 </div>
                 <div className="p-12 space-y-12">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Email Address</label>
                       <div className="relative group">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors"><Mail size={20} /></div>
                          <input 
                            type="email" 
                            value={businessData.email}
                            onChange={e => setBusinessData({...businessData, email: e.target.value})}
                            className="w-full bg-white border border-gray-100 rounded-[1.5rem] px-16 py-5 font-bold text-black focus:ring-4 focus:ring-black/5 transition-all outline-none"
                          />
                          <div className="absolute right-7 top-1/2 -translate-y-1/2 text-green-500"><Check size={20} /></div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Phone Numbers</label>
                       <div className="space-y-4">
                          {businessData.phones.map((p, idx) => (
                             <div key={idx} className="relative group flex items-center gap-4">
                                <div className="flex-1 relative">
                                   <div className="absolute left-7 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors"><Phone size={20} /></div>
                                   <input 
                                     type="text" 
                                     value={p}
                                     onChange={(e) => {
                                       const newPhones = [...businessData.phones]
                                       newPhones[idx] = e.target.value
                                       setBusinessData({ ...businessData, phones: newPhones })
                                     }}
                                     className="w-full bg-white border border-gray-100 rounded-[1.5rem] px-16 py-5 font-bold text-black focus:ring-4 focus:ring-black/5 transition-all outline-none"
                                   />
                                </div>
                                {idx === 0 && (
                                   <button className="p-5.5 bg-gray-50 text-black rounded-2xl hover:bg-gray-100 transition-all border border-gray-100">
                                      <Plus size={22} className="stroke-[3px]" />
                                   </button>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Office Address</label>
                       <div className="relative group">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors"><MapPin size={20} /></div>
                          <input 
                            type="text" 
                            value={businessData.address}
                            onChange={e => setBusinessData({...businessData, address: e.target.value})}
                            className="w-full bg-white border border-gray-100 rounded-[1.5rem] px-16 py-5 font-bold text-black focus:ring-4 focus:ring-black/5 transition-all outline-none"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end mt-auto">
                 <button className="bg-black hover:bg-gray-800 text-white font-black text-sm uppercase tracking-widest px-12 py-5 rounded-[2rem] shadow-2xl shadow-black/30 flex items-center gap-3 transition-all active:scale-95">
                    <Save size={20} /> Update Matrix
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Social & Quick Links Table UI */}
      {(activeTab === 'social' || activeTab === 'quick') && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="overflow-x-auto min-h-[400px]">
             <table className="w-full text-sm">
               <thead>
                 <tr className="bg-gray-50/80 border-b border-gray-100">
                   <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-black/40">{activeTab === 'social' ? 'Platform Node' : 'Link Identifier'}</th>
                   <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Routing URL</th>
                   <th className="px-12 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] w-[180px] text-black/40">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {(activeTab === 'social' ? socialLinks : quickLinks).length === 0 ? (
                    <tr>
                       <td colSpan={3} className="px-10 py-32 text-center">
                          <div className="flex flex-col items-center gap-6 opacity-20">
                             <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                                {activeTab === 'social' ? <Share2 size={56} /> : <LinkIcon size={56} />}
                             </div>
                             <p className="text-xs font-black uppercase tracking-[0.4em]">Registry Empty</p>
                          </div>
                       </td>
                    </tr>
                 ) : (activeTab === 'social' ? socialLinks : quickLinks).map((item: any) => (
                   <tr key={item.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                     <td className="px-12 py-7">
                        <p className="font-black text-black text-base tracking-tighter capitalize">{item.name || item.platform}</p>
                     </td>
                     <td className="px-12 py-7">
                        <p className="font-bold text-[#96b1d8] text-sm tracking-tight truncate max-w-xl">{item.url}</p>
                     </td>
                     <td className="px-12 py-7 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => { setEditingItem(item); setFormName(item.name || item.platform); setFormUrl(item.url); setShowItemModal(true); }}
                             className="p-3 text-black/40 hover:text-black hover:bg-white rounded-2xl transition-all"
                           >
                             <Pencil size={18} />
                           </button>
                           <button 
                             onClick={() => handleDeleteItem(item.id)}
                             className="p-3 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="px-12 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[11px] font-black text-black/20 uppercase tracking-widest">
                 Registry Navigation · Page 1 of 1
              </p>
              <div className="flex items-center gap-4">
                 <span className="text-[11px] font-black text-black/20 uppercase tracking-widest">Index Control</span>
                 <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[11px] font-black outline-none shadow-sm cursor-pointer">
                    <option>10</option><option>50</option>
                 </select>
              </div>
           </div>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="overflow-x-auto">
             <table className="w-full text-sm">
               <thead>
                 <tr className="bg-gray-50/80 border-b border-gray-100">
                   <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Method Entity</th>
                   <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Security Layer</th>
                   <th className="px-12 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {payments.map(method => (
                   <tr key={method.id} className="group hover:bg-gray-50/30 transition-all">
                     <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl border border-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-500">{method.icon}</div>
                           <div>
                              <p className="font-black text-black text-xl tracking-tighter leading-none">{method.name}</p>
                              <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mt-2">{method.id}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-12 py-8 text-black/40 font-black uppercase tracking-[0.15em] text-[11px]">{method.provider}</td>
                     <td className="px-12 py-8">
                        <div className="flex items-center justify-end gap-3 translate-x-2">
                           <button 
                             onClick={() => handleTogglePayment(method.id)}
                             className={`w-14 h-8 rounded-full transition-all relative ${method.status ? 'bg-black shadow-lg shadow-black/20' : 'bg-gray-200 shadow-inner'}`}
                           >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${method.status ? 'left-7' : 'left-1'}`} />
                           </button>
                           <span className={`text-[10px] font-black uppercase tracking-widest min-w-[50px] ${method.status ? 'text-black' : 'text-gray-300'}`}>
                              {method.status ? 'Streaming' : 'Internal'}
                           </span>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* CRUD Modal for Social/Quick Links */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={() => setShowItemModal(false)}>
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
              <div className="bg-gray-50/50 px-12 py-10 flex items-center justify-between border-b border-gray-100">
                 <div>
                    <h2 className="text-3xl font-black text-black tracking-tighter">{editingItem ? 'Modify' : 'Manifest'} {activeTab === 'social' ? 'Social Link' : 'Quick Link'}</h2>
                    <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mt-1">Registry Protocol 8.4</p>
                 </div>
                 <button onClick={() => setShowItemModal(false)} className="p-5 bg-white rounded-3xl shadow-sm text-black/20 hover:text-black transition-all"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">{activeTab === 'social' ? 'Platform Alias' : 'Link Alias'}</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-gray-50/50 border border-transparent rounded-[1.5rem] px-8 py-5 font-bold text-black focus:bg-white focus:border-black transition-all outline-none" 
                      placeholder="e.g. Facebook, Instagram, or Documentation" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Routing URL</label>
                    <input 
                      type="text" 
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      className="w-full bg-gray-50/50 border border-transparent rounded-[1.5rem] px-8 py-5 font-bold text-black focus:bg-white focus:border-black transition-all outline-none" 
                      placeholder="https://..." 
                    />
                 </div>
              </div>
              <div className="px-12 py-10 bg-gray-50/50 border-t border-gray-100 text-right">
                 <button 
                   onClick={handleSaveItem}
                   disabled={processing || !formName || !formUrl}
                   className="bg-black text-white font-black text-sm uppercase tracking-widest px-14 py-5 rounded-[2rem] shadow-2xl shadow-black/30 active:scale-95 transition-all disabled:opacity-50"
                 >
                    {processing ? 'Processing...' : (editingItem ? 'Commit Changes' : 'Finalize Registry')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}