'use client'
import { useEffect } from 'react'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'

export default function ProductsPage() {
  const { products, isLoading, error, fetchProducts } = useProductStore()
  const { addItem } = useCartStore()


  useEffect(() => {
    fetchProducts()
  }, [])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--color-muted)]">Loading products…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1
        className="text-4xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        All Products
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-[var(--color-muted)] mt-20">
          No products found.
        </p>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const { addItem } = useCartStore()   // add to cart directly from card

  return (
    <div className="group">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden mb-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              No image
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-[var(--color-charcoal)] mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {product.sale_price ? (
            <>
              <span className="text-sm font-semibold">
                ${product.sale_price}
              </span>
              <span className="text-xs text-[var(--color-muted)] line-through">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">${product.price}</span>
          )}
        </div>
      </Link>

      <button
        onClick={() => addItem(product.id, 1)}
        className="btn-primary w-full mt-3 text-sm py-2"
      >
        Add to cart
      </button>
    </div>
  )
}