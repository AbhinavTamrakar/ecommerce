"use client";
import { Banner, Product } from "@/types";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  banners: Banner[];
  products?: Product[];
}

const TEST_PRODUCTS = [
  {
    id: 1,
    name: "Summer Dress",
    price: 40,
    sale_price: null,
    category: { name: "Summer Collection" },
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    name: "Cotton Shirt",
    price: 49,
    sale_price: null,
    category: { name: "T-Shirts" },
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    name: "Formal Wear",
    price: 50,
    sale_price: null,
    category: { name: "Formal Wear" },
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop",
  },
];

function getImgSrc(product: any): string | null {
  if (product.images?.[0]) return getImageUrl(product.images[0]);
  if (product.thumbnail) return getImageUrl(product.thumbnail);
  if (product.image) return product.image;
  return null;
}

function ProductCard({ product }: { product: any }) {
  const imgSrc = getImgSrc(product);
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[200px] lg:w-[240px]">
      <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[340px] shadow-lg overflow-hidden rounded-sm">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 text-sm">No image</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-2">
          <p className="text-white/70 text-[10px] uppercase tracking-widest">
            {product.category?.name}
          </p>
          <p className="text-white text-sm font-semibold truncate">
            {product.name}
          </p>
          <p className="text-orange-300 text-sm font-bold">
            ${product.sale_price ?? product.price}
          </p>
        </div>
        <Link
          href={`/products/${product.id}`}
          className="absolute top-2 right-2 bg-black/75 hover:bg-white/40 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider px-2 py-1 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export function HeroSection({ banners: rawBanners, products = [] }: Props) {
  const [current, setCurrent] = useState(0);

  // Filter and normalize banners
  const banners = rawBanners
    .filter(b => (!b.position || b.position === 'hero') && b.is_active !== false)
    .map(b => ({
      ...b,
      title: b.title || b.name,
      image: b.image || (b.images && b.images.length > 0 ? b.images[0] : ''),
    }))
    .filter(b => b.image); // Only keep banners with an image

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % banners.length),
      5000
    );
    return () => clearInterval(t);
  }, [banners.length]);

  const displayProducts = products.length > 0 ? products : TEST_PRODUCTS;
  const getProductForSlide = (index: number) =>
    displayProducts[index % displayProducts.length];

  // ── Fallback (no banners) ─────────────────────────────
  if (!banners.length) {
    return (
      <section className="relative bg-orange-50 overflow-hidden rounded-lg">
        {/* Background blobs */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[var(--color-accent)] blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[var(--color-accent)] blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* TOP: Product cards row */}
        <div className="relative z-10 pt-8 overflow-hidden">
          <div className="animate-hero-scroll flex gap-4 px-6 pb-2">
            {[...displayProducts, ...displayProducts].map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
          </div>
        </div>

        {/* BOTTOM: Text content */}
        <div className="relative z-10 px-6 pt-6 pb-20 flex flex-col items-center text-center">
          <p className="text-xl font-bold uppercase tracking-widest text-orange-400 mb-3">
            New Season 2026
          </p>
          <h1
            className="text-3xl sm:text-5xl md:text-6xl italic font-bold leading-none mb-4 py-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Define Your Style
          </h1>
          {/*<p className="text-gray-500 max-w-sm mb-6 text-sm hidden sm:block">
            Curated fashion for the modern individual. Premium quality,
            timeless design.
          </p>*/}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className=" btn-primary px-2 py-3">
              Shop Collection
            </Link>
            <Link
              href="/new-arrivals"
              className="btn-outline px-2 py-3"
              style={{
                borderColor: "blue-500",
                color: "blue-200",
              }}
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ── Banner slider ─────────────────────────────────────
  const banner = banners[current];

  return (
    <section className="relative overflow-hidden rounded-lg">
      {/* Background slides */}
      {banners.map((b, i) => (
        <div
          key={b.id || i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {b.image && getImageUrl(b.image) && (
            <img
              src={getImageUrl(b.image)}
              alt={b.title || "Banner"}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        </div>
      ))}

      <div className="relative z-10 flex flex-col min-h-[500px] sm:min-h-[600px]">

        {/* TOP: Product cards */}
        <div className="pt-8 overflow-hidden flex-shrink-0">
          <div className="animate-hero-scroll flex gap-4 px-6 pb-2">
            {/* Duplicate products for seamless infinite loop */}
            {[...displayProducts, ...displayProducts].map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
          </div>
        </div>

        {/* BOTTOM: Text content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-16 pt-6">
          <div className="text-white max-w-2xl text-center">
            {banner.subtitle && (
              <p className="text-xs uppercase tracking-widest text-white/60 mb-3">
                {banner.subtitle}
              </p>
            )}
            {banner.title && (
              <h1
                className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {banner.title}
              </h1>
            )}
            <Link
              href={banner.link || "/products"}
              className="btn-primary inline-block"
            >
              {banner.button_text || "Shop Now"}
            </Link>
          </div>
        </div>
      </div>

      {/* Slider controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((c) => (c - 1 + banners.length) % banners.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="w-6 h-0.5 transition-colors"
                style={{
                  background: i === current ? "white" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}