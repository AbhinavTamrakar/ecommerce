import { cookies } from 'next/headers'
import { AddCategoryForm } from '@/components/admin/AddCategoryForm'
import { DeleteCategoryButton } from '@/components/admin/DeleteCategoryButton'

const BASE = process.env.API_URL?.replace('/api', '') || 'http://194.146.12.71:8008'

async function getCategories(token: string) {
  try {
    const res = await fetch(`${BASE}/api/public/categories`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.data || []
  } catch { return [] }
}

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || ''
  const categories = await getCategories(token)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 text-sm mt-1">{categories.length} categories total</p>
      </div>

      <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
        {/* Add Category Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md">
          <h2 className="font-semibold text-gray-800 mb-4">Add Category</h2>
          <AddCategoryForm />
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Slug</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">No categories yet</td>
                </tr>
              ) : categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image && (
                        <img src={`${BASE}/storage/${cat.image}`} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DeleteCategoryButton id={cat.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}