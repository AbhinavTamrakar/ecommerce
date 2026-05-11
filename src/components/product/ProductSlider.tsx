"use client";
import { useRef } from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductSlider({ products }: { products: Product[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/3 z-10 bg-white border border-gray-200 shadow-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 hidden sm:block"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6"
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[60%] sm:w-[32%] lg:w-[22%]"
          >
            <ProductCard product={product} index={idx} />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/3 z-10 bg-white border border-gray-200 shadow-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 hidden sm:block"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>

      {/* Mobile arrows */}
      <div className="sm:hidden flex justify-end gap-3 px-4 mt-2">
        <button
          onClick={() => scroll("left")}
          className="bg-gray-100 p-1.5 rounded-sm active:bg-gray-200"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="bg-gray-100 p-1.5 rounded-sm active:bg-gray-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}