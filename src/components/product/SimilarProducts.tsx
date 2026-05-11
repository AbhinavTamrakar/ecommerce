import { Product } from "@/types";
import { ProductSlider } from "./ProductSlider";

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function getSimilarProducts(categorySlug: string, excludeId: number): Promise<Product[]> {
  try {
    // First try: fetch from same category
    const res = await fetch(`${BASE}/api/public/categories/${categorySlug}/products`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const categoryProducts: Product[] = data.data ?? [];
      const filtered = categoryProducts.filter(p => p.id !== excludeId).slice(0, 8);

      // If we have at least 1 similar product in the category, use them
      if (filtered.length > 0) {
        return filtered;
      }
    }

    // Fallback: fetch all products and exclude current one
    const fallbackRes = await fetch(`${BASE}/api/public/products`, {
      cache: 'no-store',
    });

    if (!fallbackRes.ok) return [];

    const fallbackData = await fallbackRes.json();
    const allProducts: Product[] = fallbackData.data ?? [];

    return allProducts
      .filter(p => p.id !== excludeId)
      .slice(0, 8);

  } catch {
    return [];
  }
}

export async function SimilarProducts({
  categorySlug,
  excludeId,
}: {
  categorySlug: string;
  excludeId: number;
}) {
  const products = await getSimilarProducts(categorySlug, excludeId);

  if (!products.length) return null;

  return (
    <div className="mt-20 border-t border-[var(--color-border)] pt-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-1">
          You May Also Like
        </p>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Similar Products
        </h2>
      </div>
      <ProductSlider products={products} />
    </div>
  );
}