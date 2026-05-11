"use client";
import { Product, ProductVariant } from "@/types";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ShoppingBag, Heart, ChevronLeft } from "lucide-react";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

export function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const images = product.images?.length
    ? product.images.map((img) => typeof img === 'string' ? img : img.url)
    : product.thumbnail
    ? [product.thumbnail]
    : [];

  const mainImage = images[selectedImage] || null;

  // Get unique colors and sizes from attributes
  const colors = product.attributes?.find(a => a.name === 'Color')?.values || []
  const sizes = product.attributes?.find(a => a.name === 'Size')?.values || []

  // Find the matching variant based on selected color + size
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product.variants?.length) return null
    return product.variants.find(v => {
      const hasColor = !selectedColor || v.options.some(o => o.attribute_name === 'Color' && o.value === selectedColor)
      const hasSize = !selectedSize || v.options.some(o => o.attribute_name === 'Size' && o.value === selectedSize)
      return hasColor && hasSize
    }) || null
  }, [product.variants, selectedColor, selectedSize])

  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const isOutOfStock = currentStock === 0

  const discountPct = product.discount_percentage ? Math.round(Number(product.discount_percentage)) : null

  return (
    <div className="pt-8 pb-12">
        {/* Breadcrumb */}
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-charcoal)] mb-8 transition-colors">
          <ChevronLeft size={16} />
          Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-20 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-[var(--color-charcoal)]" : "border-transparent"
                    }`}
                    style={{ minWidth: "80px" }}
                  >
                    <Image src={getImageUrl(img)} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 relative aspect-square bg-gray-50 overflow-hidden">
              {discountPct && (
                <span className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {discountPct}% Off
                </span>
              )}
              {mainImage ? (
                <Image src={getImageUrl(mainImage)} alt={product.name} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingBag size={60} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-start">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-2">
              {product.category?.name || "Fashion"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {product.name}
            </h1>

            {/* Price */}
            {(() => {
              const discountAmt = product.discount_percentage ? Number(product.discount_percentage) : 0
              const originalPrice = Number(product.price)
              const salePrice = discountAmt > 0 ? originalPrice * (1 - discountAmt / 100) : null
              const displayPrice = salePrice ?? Number(currentPrice)
              const savings = salePrice ? originalPrice - salePrice : 0
              return (
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {salePrice ? (
                    <>
                      <span className="text-3xl font-bold text-red-500">
                        {formatPrice(displayPrice)}
                      </span>
                      <span className="text-lg text-[var(--color-muted)] line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                        Save {formatPrice(savings)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">
                      {formatPrice(displayPrice)}
                    </span>
                  )}
                </div>
              )
            })()}

            {product.short_description && (
              <p className="text-[var(--color-muted)] leading-relaxed mb-6 text-sm">
                {product.short_description}
              </p>
            )}

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                  Color {selectedColor && <span className="text-[var(--color-charcoal)] font-semibold">— {selectedColor}</span>}
                </p>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(c.value === selectedColor ? null : c.value)}
                      title={c.value}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.value
                          ? 'border-[var(--color-charcoal)] scale-110'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: c.color_code || '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                  Size {selectedSize && <span className="text-[var(--color-charcoal)] font-semibold">— {selectedSize}</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s.value === selectedSize ? null : s.value)}
                      className={`px-3 py-1.5 text-sm border transition-all ${
                        selectedSize === s.value
                          ? 'border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white'
                          : 'border-[var(--color-border)] hover:border-[var(--color-charcoal)]'
                      }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-wider text-[var(--color-muted)] w-20">Quantity</span>
                <div className="flex items-center border border-[var(--color-border)]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 text-lg hover:bg-gray-50 transition-colors"
                  >−</button>
                  <span className="px-4 py-2 text-sm font-medium min-w-10 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(currentStock || 99, qty + 1))}
                    className="px-3 py-2 text-lg hover:bg-gray-50 transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => addItem(selectedVariant?.id ?? product.id, qty)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={isOutOfStock}
                >
                  <ShoppingBag size={16} />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button className="btn-outline px-4">
                  <Heart size={18} />
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="border-t border-[var(--color-border)] pt-6 mt-6 space-y-2 text-sm text-[var(--color-muted)]">
              {selectedVariant && (
                <p><span className="text-[var(--color-charcoal)] font-medium">SKU:</span> {selectedVariant.sku}</p>
              )}
              {product.type && (
                <p><span className="text-[var(--color-charcoal)] font-medium">Type:</span> {typeof product.type === 'object' ? product.type.name : product.type}</p>
              )}
              {product.delivery_charge && (
                <p><span className="text-[var(--color-charcoal)] font-medium">Delivery:</span> ${product.delivery_charge}</p>
              )}
              <p>
                <span className="text-[var(--color-charcoal)] font-medium">Availability:</span>{" "}
                {isOutOfStock
                  ? <span className="text-red-500">Out of Stock</span>
                  : <span className="text-green-600">In Stock ({currentStock})</span>
                }
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}