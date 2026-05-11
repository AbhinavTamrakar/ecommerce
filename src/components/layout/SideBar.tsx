'use client'
import { useEffect, useState } from 'react'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => setShow(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!show) return null

  return (
    <aside className="w-full">
      <div className="bg-white rounded-xl p-5 border border-[#ffe8d6]">
        {children}
      </div>
    </aside>
  )
}