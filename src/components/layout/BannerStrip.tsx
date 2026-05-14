import { Banner } from '@/types';
import React from 'react';

interface Props {
  banners?: Banner[];
}

export const BannerStrip = ({ banners: rawBanners = [] }: Props) => {
  // Filter for strip banners
  const stripBanners = rawBanners
    .filter(b => b.position === 'strip' && b.is_active !== false)
    .map(b => ({
      title: b.title || b.name,
      subtitle: b.subtitle || 'Shop Now'
    }));

  const displayBanners = stripBanners.length > 0 ? stripBanners : [
    { subtitle: 'New Collection', title: 'Summer Vibes' },
    { subtitle: 'Limited Offer', title: 'Up to 50% Off', highlight: true },
    { subtitle: 'Fast Delivery', title: 'Free Shipping Over $75' },
    { subtitle: 'Special Edition', title: 'Premium Denim', highlight: true },
    { subtitle: 'Shop Now', title: 'New Arrivals 2026' },
  ];

  return (
    <div className="bg-[var(--color-charcoal)] text-white overflow-hidden flex whitespace-nowrap border-y border-white/10 mt-[64px] py-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-marquee-right flex items-center shrink-0" aria-hidden={i === 1}>
          {displayBanners.map((b, idx) => (
            <div key={idx} className="px-12 flex flex-col items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                {b.subtitle}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" 
                  style={{ 
                    fontFamily: "var(--font-display)",
                    color: (idx % 2 !== 0) ? "#fe8b01" : "inherit" 
                  }}>
                {b.title}
              </h2>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
