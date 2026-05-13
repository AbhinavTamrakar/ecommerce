'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface Variant {
  id?: number
  sku: string
  price: string
  stock: string
  color: string
  size: string
  attributeValueIds?: number[] // stored from API, sent back as-is
}

interface Props { productId?: number }

export default function ProductForm({ productId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!productId)
  const [categories, setCategories] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [existingAttributes, setExistingAttributes] = useState<any[]>([])
  const [attrValueMap, setAttrValueMap] = useState<{ colorMap: Record<string,number>, sizeMap: Record<string,number> }>({ colorMap: {}, sizeMap: {} })
  const [form, setForm] = useState({
    name: '', slug: '', price: '', stock: '', description: '',
    short_description: '', discount_percentage: '0',
    status: 'active', category_id: '', type_id: '', delivery_charge: '0',
  })
  const [variants, setVariants] = useState<Variant[]>([])
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    const token = useAuthStore.getState().token
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`${BASE}/api/public/categories`, { headers })
      .then(r => r.json()).then(d => {
        console.log('Categories response:', d)
        setCategories(d.data || d || [])
      })
      .catch(err => console.error('Categories fetch error:', err))

    // Fetch types
    fetch(`${BASE}/api/public/types`, { headers })
      .then(r => r.json()).then(d => setTypes(d.data || [])).catch(() => {})

    // Fetch attributes with nested values to build color/size ID maps
    fetch(`${BASE}/api/attributes`, { headers })
      .then(r => r.json())
      .then(d => {
        const attrs: any[] = d.data || d || []
        const colorMap: Record<string,number> = {}
        const sizeMap: Record<string,number> = {}
        attrs.forEach((attr: any) => {
          const attrName = (attr.name || '').toLowerCase()
          ;(attr.values || []).forEach((v: any) => {
            if (attrName === 'color') colorMap[v.value] = v.id
            if (attrName === 'size') sizeMap[v.value] = v.id
          })
        })
        console.log('[ProductForm] colorMap:', colorMap, 'sizeMap:', sizeMap)
        setAttrValueMap({ colorMap, sizeMap })
      })
      .catch(() => {})

    if (productId) {
      fetch(`${BASE}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
        .then(r => r.json())
        .then(d => {
          console.log('[ProductForm] Raw product response:', d)
          // Handle both { data: product } and flat product object
          const p = d.data ?? d
          if (!p || typeof p !== 'object' || !p.name) throw new Error('No product data returned')
          setForm({
            name: p.name || '',
            slug: p.slug || '',
            price: String(p.price || ''),
            stock: String(p.stock || ''),
            description: p.description || '',
            short_description: p.short_description || '',
            discount_percentage: String(p.discount_percentage || '0'),
            status: p.status || 'active',
            category_id: String(p.category_id || ''),
            type_id: String(p.type_id || ''),
            delivery_charge: String(p.delivery_charge || '0'),
          })
          setExistingAttributes(p.attributes || [])
          // Build color/size name->id map from the product's own variant options
          const colorMap: Record<string,number> = {}
          const sizeMap: Record<string,number> = {}
          ;(p.variants || []).forEach((v: any) => {
            ;(v.options || []).forEach((o: any) => {
              const attrName = (o.attribute_name || '').toLowerCase()
              // Try all possible ID field names the API might return
              const valId = o.attribute_value_id ?? o.product_attribute_value_id ?? o.pivot?.attribute_value_id ?? o.id
              console.log('[ProductForm] option fields:', JSON.stringify(o))
              if (attrName === 'color' && valId) colorMap[o.value] = valId
              if (attrName === 'size' && valId) sizeMap[o.value] = valId
            })
          })
          console.log('[ProductForm] Built maps from product variants — colorMap:', colorMap, 'sizeMap:', sizeMap)
          console.log('[ProductForm] First variant raw:', JSON.stringify(p.variants?.[0]))
          setAttrValueMap({ colorMap, sizeMap })
          if (p.variants?.length) {
            setVariants(p.variants.map((v: any) => ({
              id: v.id,
              sku: v.sku || '',
              price: String(v.price || ''),
              stock: String(v.stock || 0),
              color: v.options?.find((o: any) => o.attribute_name === 'Color')?.value || '',
              size: v.options?.find((o: any) => o.attribute_name === 'Size')?.value || '',
              // Store the IDs from the API so we can send them back unchanged
              attributeValueIds: (v.options || []).map((o: any) => o.attribute_value_id ?? o.id).filter(Boolean),
            })))
          }
        })
        .catch(err => {
          console.error('Failed to load product:', err)
          toast.error('Failed to load product data.')
        })
        .finally(() => setFetching(false))
    }
  }, [productId])

  const addVariant = () => {
    setVariants([...variants, { sku: '', price: form.price, stock: '0', color: '', size: '' }])
  }

  const removeVariant = (i: number) => {
    setVariants(variants.filter((_, idx) => idx !== i))
  }

  const updateVariant = (i: number, key: keyof Variant, value: string) => {
    const updated = [...variants]
    updated[i] = { ...updated[i], [key]: value }
    // Auto-generate SKU from color+size
    if (key === 'color' || key === 'size') {
      const color = key === 'color' ? value : updated[i].color
      const size = key === 'size' ? value : updated[i].size
      if (color || size) {
        updated[i].sku = `VAR-${color.toUpperCase().replace(/\s+/g, '-')}-${size.toUpperCase().replace(/\s+/g, '-')}`.replace(/-$/, '')
      }
    }
    setVariants(updated)
  }

  // Use color/size maps built from product's own variant options
  const { colorMap, sizeMap } = attrValueMap

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = useAuthStore.getState().token
      const url = productId ? `${BASE}/api/products/${productId}` : `${BASE}/api/products`
      // Laravel requires POST + _method=PUT for multipart/form-data (PUT doesn't support file uploads)
      const method = 'POST'

      console.log('[ProductForm] Submitting', { url, method, productId })

      const formData = new FormData()
      // Laravel requires _method spoofing for PUT with multipart/form-data
      if (productId) formData.append('_method', 'PUT')
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') formData.append(k, String(v))
      })
      // Always explicitly send status
      formData.set('status', form.status)
      if (image) formData.append('image', image)

      // Append variants
      let variantIndex = 0
      variants.forEach((v) => {
        const attrValues: number[] = []
        if (v.color && colorMap[v.color]) attrValues.push(colorMap[v.color])
        if (v.size && sizeMap[v.size]) attrValues.push(sizeMap[v.size])

        if (v.id) {
          // Existing variant: use stored IDs, fall back to colorMap/sizeMap lookup
          const ids = v.attributeValueIds?.length ? v.attributeValueIds : attrValues
          // If still empty, log warning and skip to avoid API validation error
          if (ids.length === 0) {
            console.warn('[ProductForm] No attribute_value IDs for existing variant', v, '— skipping attribute_values')
          }
          formData.append(`variants[${variantIndex}][id]`, String(v.id))
          formData.append(`variants[${variantIndex}][sku]`, v.sku)
          formData.append(`variants[${variantIndex}][price]`, v.price || form.price)
          formData.append(`variants[${variantIndex}][stock]`, v.stock)
          ids.forEach((id, j) => {
            formData.append(`variants[${variantIndex}][attribute_values][${j}]`, String(id))
          })
          variantIndex++
        } else {
          // New variant: resolve IDs from colorMap/sizeMap
          if (attrValues.length === 0) {
            console.warn('[ProductForm] No attribute IDs found for new variant', v)
          }
          formData.append(`variants[${variantIndex}][sku]`, v.sku)
          formData.append(`variants[${variantIndex}][price]`, v.price || form.price)
          formData.append(`variants[${variantIndex}][stock]`, v.stock)
          attrValues.forEach((id, j) => {
            formData.append(`variants[${variantIndex}][attribute_values][${j}]`, String(id))
          })
          variantIndex++
        }
      })

      const res = await fetch(url, {
        method,
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err))
      }
      toast.success(productId ? 'Product updated!' : 'Product created!')
      router.push('/admin/products')
    } catch (err: any) {
      console.error(err)
      toast.error('Something went wrong. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-gray-400 text-sm p-8">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
          <ChevronLeft size={15} /> Back to Products
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Name *</label>
              <input value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Category *</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Type *</label>
              <select value={form.type_id} onChange={e => setForm({ ...form, type_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                <option value="">Select type</option>
                {types.length > 0 ? types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>) : (
                  <>
                    <option value="1">Men</option>
                    <option value="2">Women</option>
                    <option value="3">Kids</option>
                    <option value="4">Unisex</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Price *</label>
              <input type="number" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Stock *</label>
              <input type="number" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Discount %</label>
              <input type="number" step="0.01" value={form.discount_percentage}
                onChange={e => setForm({ ...form, discount_percentage: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Delivery Charge</label>
              <input type="number" step="0.01" value={form.delivery_charge}
                onChange={e => setForm({ ...form, delivery_charge: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Short Description</label>
            <input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          </div>
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Variants</h2>
            <button type="button" onClick={addVariant}
              className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={13} /> Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No variants. Click "Add Variant" to add color/size options.</p>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-6 gap-2 text-xs uppercase tracking-wider text-gray-400 font-medium px-1">
                <span>Color</span>
                <span>Size</span>
                <span>SKU</span>
                <span>Price</span>
                <span>Stock</span>
                <span></span>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 items-center bg-gray-50 rounded-lg p-3">
                  <div>
<select value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 bg-white">
                      <option value="">Color</option>
                      {Object.keys(colorMap).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
<select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 bg-white">
                      <option value="">Size</option>
                      {Object.keys(sizeMap).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
<input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 bg-white" />
                  </div>
                  <div>
<input type="number" step="0.01" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 bg-white" />
                  </div>
                  <div>
<input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)}
                      placeholder="Stock"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 bg-white" />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeVariant(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f97316] transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </button>
          <Link href="/admin/products"
            className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}