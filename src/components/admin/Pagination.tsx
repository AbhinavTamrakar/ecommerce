'use client'

import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  pageSize,
  onPageSizeChange
}: PaginationProps) {
  const showNav = totalPages > 0;
  if (!showNav) return null;

  return (
    <div className="flex items-center justify-between py-2 flex-wrap gap-4">
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] leading-none">
          Registry Navigation
        </p>
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">
          Showing Page {currentPage} <span className="opacity-40">of</span> {totalPages}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Index Control */}
        {onPageSizeChange && (
           <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100/50 rounded-2xl px-4 h-12 shadow-inner">
              <SlidersHorizontal size={14} className="text-black/20" />
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">Index Control</span>
                 <select 
                   value={pageSize} 
                   onChange={(e) => onPageSizeChange(Number(e.target.value))}
                   className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[#96b1d8] outline-none cursor-pointer p-0"
                 >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                 </select>
              </div>
           </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-black/40 hover:text-[#96b1d8] hover:border-[#96b1d8]/30 hover:shadow-lg hover:shadow-[#96b1d8]/5 disabled:opacity-10 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          
          <div className="flex items-center gap-1.5 px-4 h-12 rounded-2xl bg-gray-50/50 border border-gray-100/50">
             {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = currentPage;
                if (totalPages > 5) {
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                } else {
                  pageNum = i + 1;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                      currentPage === pageNum 
                      ? 'bg-black text-white shadow-lg' 
                      : 'text-black/30 hover:text-black hover:bg-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
             })}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-black/40 hover:text-[#96b1d8] hover:border-[#96b1d8]/30 hover:shadow-lg hover:shadow-[#96b1d8]/5 disabled:opacity-10 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
