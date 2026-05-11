import { cookies } from 'next/headers'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'

const BASE = process.env.API_URL?.replace('/api', '') || 'http://194.146.12.71:8008'

async function getProducts(token: string) {
  try {
    const res = await fetch(`${BASE}/api/products`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch { return [] }
}

export default async function AdminProductsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || ''
  const products = await getProducts(token)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#96b1d8] text-black/50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#f97316] hover:text-white transition-colors"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Scrollable table wrapper — works on all screen sizes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Product</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Price</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Stock</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No products found</td>
              </tr>
            ) : products.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.primary_image?.url ? (
                      <img src={product.primary_image.url} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 truncate">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name || '—'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">${Number(product.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${product.stock <= 3 ? 'text-red-500' : 'text-gray-900'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/products/${product.id}`} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <DeleteProductButton id={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}