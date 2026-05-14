import { Product, Category } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { PriceSlider } from "@/components/product/PriceSlider";
import { SidebarWrapper } from "@/components/layout/SideBar";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008';

async function getNewArrivals(params: {
  maxPrice?: string;
  category?: string;
  type?: string;
}): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE}/api/public/products`, { cache: "no-store" });
    if (!res.ok) return [];
    
    let data = (await res.json()).data ?? [];
    
    // Sort by ID or created_at if available, assuming higher ID = newer
    data.sort((a: any, b: any) => (b.id - a.id));

    // Apply filters
    if (params.category) {
      data = data.filter((p: Product) => String(p.category?.id) === params.category);
    }
    if (params.maxPrice) {
      data = data.filter((p: Product) => p.price <= Number(params.maxPrice));
    }
    if (params.type) {
      data = data.filter((p: Product) => {
        const typeSlug = typeof p.type === 'object' ? p.type?.slug : p.type;
        return typeSlug === params.type;
      });
    }

    return data.slice(0, 12);
  } catch (error) {
    console.error("Fetch New Arrivals Error:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE}/api/public/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch (error) {
    return [];
  }
}

async function getTypes(): Promise<{ id: number; name: string; slug: string }[]> {
  try {
    const res = await fetch(`${BASE}/api/public/types`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch (error) {
    return [];
  }
}

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    maxPrice?: string;
    category?: string;
    type?: string;
  }>;
}) {
  const sp = await searchParams;
  const [products, categories, types] = await Promise.all([
    getNewArrivals(sp),
    getCategories(),
    getTypes(),
  ]);

  return (
    <div className="min-h-screen pt-0 pb-20 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-12 items-start pt-6">

          {/* Sidebar */}
          <SidebarWrapper>
            <div className="sticky top-[80px]">
              <div className="mb-10 pb-8 border-b border-black/5">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-5">
                  Price Range
                </h3>
                <PriceSlider initialMax={sp.maxPrice} />
              </div>
              <ProductFilters categories={categories} types={types} currentParams={sp} />
            </div>
          </SidebarWrapper>

          {/* Product listing */}
          <main className="w-full min-w-0">
            <div className="mb-8 text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] mb-2 font-semibold">
                Just Landed
              </p>
              <h1
                className="text-4xl sm:text-5xl font-bold leading-none mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                New Arrivals
              </h1>
              <p className="text-[var(--color-muted)] text-sm max-w-xl">
                Be the first to wear our latest collection. Handpicked styles that just arrived in our store.
              </p>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-[var(--color-muted)] font-medium">No new arrivals found.</p>
                <a href="/products" className="text-xs text-[#FF8C00] underline mt-2 block">View all products</a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
