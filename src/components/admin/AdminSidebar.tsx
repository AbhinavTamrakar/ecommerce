'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuthStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? 'bg-[#f97316] text-white font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const BottomLinks = () => (
    <div className="px-3 py-4 border-t border-white/10">
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors mb-1"
      >
        ← Back to Store
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors w-full text-left"
      >
        <LogOut size={17} />
        Sign Out
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar — only on md+ */}
      {!isMobile && (
        <aside className="fixed top-0 left-0 h-full w-64 bg-[#96b1d8] text-black flex flex-col z-50">
          <div className="px-6 py-5 border-b border-white/10">
            <p className="text-[11px] uppercase tracking-widest font-bold text-black/40 mb-0.5">ShakTa</p>
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <NavLinks />
          <BottomLinks />
        </aside>
      )}

      {/* Mobile Top Bar — only on mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#96b1d8] text-black flex items-center justify-between px-4 z-50 shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 leading-none">ShakTa</p>
            <h1 className="text-sm font-bold leading-tight">Admin Panel</h1>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <aside
          className="fixed top-0 left-0 h-full w-64 bg-[#96b1d8] text-black flex flex-col z-50 transition-transform duration-300"
          style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div className="px-6 py-5 border-b border-white/10">
            <p className="text-[11px] uppercase tracking-widest font-bold text-black/40 mb-0.5">ShakTa</p>
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <NavLinks />
          <BottomLinks />
        </aside>
      )}
    </>
  )
}