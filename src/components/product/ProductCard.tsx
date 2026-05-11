"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const image =
    product.thumbnail ||
    product.images?.[0]?.url ||
    null;

  const delay = index * 100;

  return (
    <div
      className="product-card bg-white group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="img-zoom relative aspect-[3/4] overflow-hidden bg-gray-50">
          {image ? (
            <Image
              src={getImageUrl(image)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag size={40} />
            </div>
          )}
          {product.discount_percentage && Number(product.discount_percentage) > 0 && (
            <span className="absolute top-3 left-3 bg-[var(--color-accent)] text-white text-xs px-2 py-0.5 uppercase tracking-wider">
              Sale
            </span>
          )}
          {product.discount_percentage && Number(product.discount_percentage) > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              {Math.round(Number(product.discount_percentage))}% Off
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
            {product.category?.name || "Fashion"}
          </p>
          <h3 className="font-medium text-sm leading-snug mb-2 hover:text-[var(--color-accent)] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discount_percentage && Number(product.discount_percentage) > 0 ? (
              <>
                <span className="text-sm font-semibold text-red-500">
                  {formatPrice(Number(product.price) * (1 - Number(product.discount_percentage) / 100))}
                </span>
                <span className="text-xs text-[var(--color-muted)] line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product.id, 1)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[var(--color-charcoal)] text-white hover:bg-[var(--color-accent)]"
            title="Add to cart"
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}