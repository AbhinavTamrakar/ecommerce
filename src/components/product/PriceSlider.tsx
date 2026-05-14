"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PlusCircle, MinusCircle } from "lucide-react";

export function PriceSlider({
  initialMax,
  initialMin,
}: {
  initialMax?: string;
  initialMin?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState(Number(initialMin ?? 0));
  const [maxPrice, setMaxPrice] = useState(Number(initialMax ?? 1000));
  const MAX = 2000;

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", String(minPrice));
    params.set("maxPrice", String(maxPrice));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const minPct = (minPrice / MAX) * 100;
  const maxPct = (maxPrice / MAX) * 100;

  return (
    <div className="space-y-4">

      {/* Price labels */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-black">${minPrice}</span>
        <span className="text-xs font-bold text-black">${maxPrice}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-[#FF8C00] rounded-full pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />

        {/* Min thumb */}
        <div
          className="absolute w-4 h-4 bg-[#FF8C00] rounded-full border-2 border-white shadow-md cursor-pointer z-10 -translate-x-1/2"
          style={{ left: `${minPct}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            const slider = e.currentTarget.parentElement!;
            const rect = slider.getBoundingClientRect();
            const move = (ev: MouseEvent) => {
              const pct = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
              const val = Math.round((pct * MAX) / 10) * 10;
              setMinPrice(Math.min(val, maxPrice - 10));
            };
            const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
          onTouchStart={(e) => {
            const slider = e.currentTarget.parentElement!;
            const rect = slider.getBoundingClientRect();
            const move = (ev: TouchEvent) => {
              const pct = Math.min(Math.max((ev.touches[0].clientX - rect.left) / rect.width, 0), 1);
              const val = Math.round((pct * MAX) / 10) * 10;
              setMinPrice(Math.min(val, maxPrice - 10));
            };
            const up = () => { window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
            window.addEventListener("touchmove", move);
            window.addEventListener("touchend", up);
          }}
        />

        {/* Max thumb */}
        <div
          className="absolute w-4 h-4 bg-[#FF8C00] rounded-full border-2 border-white shadow-md cursor-pointer z-10 -translate-x-1/2"
          style={{ left: `${maxPct}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            const slider = e.currentTarget.parentElement!;
            const rect = slider.getBoundingClientRect();
            const move = (ev: MouseEvent) => {
              const pct = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
              const val = Math.round((pct * MAX) / 10) * 10;
              setMaxPrice(Math.max(val, minPrice + 10));
            };
            const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
          onTouchStart={(e) => {
            const slider = e.currentTarget.parentElement!;
            const rect = slider.getBoundingClientRect();
            const move = (ev: TouchEvent) => {
              const pct = Math.min(Math.max((ev.touches[0].clientX - rect.left) / rect.width, 0), 1);
              const val = Math.round((pct * MAX) / 10) * 10;
              setMaxPrice(Math.max(val, minPrice + 10));
            };
            const up = () => { window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
            window.addEventListener("touchmove", move);
            window.addEventListener("touchend", up);
          }}
        />
      </div>

      {/* + on left (increases min), − on right (decreases max) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMinPrice(Math.min(minPrice + 10, maxPrice - 10))}
          className="text-[#FF8C00] hover:text-[#ea6b00] transition-colors"
          aria-label="Increase min price"
        >
          <PlusCircle size={22} />
        </button>

        <button
          onClick={() => setMaxPrice(Math.max(maxPrice - 10, minPrice + 10))}
          className="text-[#FF8C00] hover:text-[#ea6b00] transition-colors"
          aria-label="Decrease max price"
        >
          <MinusCircle size={22} />
        </button>
      </div>

      <button
        onClick={handleApply}
        className="w-full py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF8C00] transition-colors rounded-sm"
      >
        Apply Filter
      </button>
    </div>
  );
}