'use client'

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden md:block w-full">
      <div className="bg-white rounded-xl p-5 border border-[#ffe8d6]">
        {children}
      </div>
    </aside>
  )
}