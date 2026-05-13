import { cookies } from 'next/headers'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'

const BASE = process.env.API_URL?.replace('/api', '') || 'http://194.146.12.71:8008'

async function getUsers(token: string) {
  try {
    const res = await fetch(`${BASE}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.data?.data)) return data.data.data
    return []
  } catch { return [] }
}

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || ''
  const users = await getUsers(token)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 py-10">Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} users total</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">User</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Phone</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No users found</td>
              </tr>
            ) : users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.phone || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <DeleteUserButton id={user.id} />
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