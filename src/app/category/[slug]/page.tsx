import { Product, Category } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { notFound } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: Category | null = null;
  let products: Product[] = [];

  try {
    const catRes = await fetch(`${BASE}/api/public/categories`, {
      cache: "no-store",
    });

    if (catRes.ok) {
      const categories: Category[] = (await catRes.json()).data ?? [];
      category =
        categories.find(
          (c) =>
            c.slug === slug ||
            c.name.toLowerCase() === slug.toLowerCase()
        ) ?? null;
    }

    const prodRes = await fetch(
      `${BASE}/api/public/categories/${slug}/products`,
      { cache: "no-store" }
    );

    if (prodRes.ok) {
      products = (await prodRes.json()).data ?? [];
    }
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen pt-5 pb-24 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-2">
            Category
          </p>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {category?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1)}
          </h1>
          {category?.description && (
            <p className="text-[var(--color-muted)] mt-3 max-w-xl">
              {category.description}
            </p>
          )}
          <p className="text-sm text-[var(--color-muted)] mt-2">
            {products.length} products
          </p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}