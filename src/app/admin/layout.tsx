import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login?redirect=/admin')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      {/* Desktop: ml-64 for sidebar, Mobile: pt-14 for top bar */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 p-4 md:p-8 w-full min-w-0">
        {children}
      </main>
    </div>
  )
}