import React from 'react';

export const BannerStrip = () => {
  return (
    <div className="bg-[var(--color-charcoal)] text-white py-3 overflow-hidden flex whitespace-nowrap border-y border-white/10 mt-[64px]">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-marquee-right flex items-center shrink-0" aria-hidden={i === 1}>
          
          <div className="px-12 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              New Collection
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Summer Vibes
            </h2>
          </div>

          <div className="px-12 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Limited Offer
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#fe8b01" }}>
              Up to 50% Off
            </h2>
          </div>

          <div className="px-12 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Fast Delivery
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Free Shipping Over $75
            </h2>
          </div>

          <div className="px-12 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Special Edition
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#fe8b01" }}>
              Premium Denim
            </h2>
          </div>

          <div className="px-12 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Shop Now
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              New Arrivals 2026
            </h2>
          </div>

          <div className="px-12 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Shop Now
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#fe8b01" }}>
              New Years Offer
            </h2>
          </div>
          
        </div>
      ))}
    </div>
  );
};
