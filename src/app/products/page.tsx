import { Product, Category } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { PriceSlider } from "@/components/product/PriceSlider";
import { SidebarWrapper } from "@/components/layout/SideBar";

const BASE = process.env.NEXT_PUBLIC_API_URL;

interface Props {
  searchParams: Promise<{
    search?: string;
    category?: string;
    type?: string;
    maxPrice?: string;
    minPrice?: string;
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  mens: "Men",
  women: "Women",
  unisex: "Unisex",
};

async function getProducts(params: {
  search?: string;
  category?: string;
  type?: string;
  maxPrice?: string;
  minPrice?: string;
}): Promise<Product[]> {
  try {
    const url = params.category
      ? `${BASE}/api/public/categories/${params.category}/products`
      : `${BASE}/api/public/products`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    let data = (await res.json()).data ?? [];

    // Filter by type slug (mens / women / unisex)
    if (params.type) {
      data = data.filter((p: Product) => {
        const typeSlug =
          typeof p.type === "object" ? p.type?.slug : p.type;
        return typeSlug === params.type;
      });
    }

    if (params.minPrice) {
      data = data.filter(
        (p: Product) => p.price >= Number(params.minPrice)
      );
    }
    if (params.maxPrice) {
      data = data.filter(
        (p: Product) => p.price <= Number(params.maxPrice)
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (p: Product) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE}/api/public/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const [products, categories] = await Promise.all([
    getProducts(sp),
    getCategories(),
  ]);

  const title = sp.search
    ? `Results for "${sp.search}"`
    : sp.type && TYPE_LABELS[sp.type]
    ? `${TYPE_LABELS[sp.type]}'s Collection`
    : "All Products";

  return (
    <div className="min-h-screen pt-0 pb-20 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              <ProductFilters categories={categories} currentParams={sp} />
            </div>
          </SidebarWrapper>

          {/* Product listing */}
          <main className="w-full min-w-0">
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] mb-0 font-semibold">
                Our Collection
              </p>
              <h1
                className="text-3xl sm:text-4xl font-bold leading-none mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h1>
              <div className="flex justify-between items-center">
                <p className="text-[var(--color-muted)] text-[12px]">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} found
                </p>
                {sp.maxPrice && (
                  <a
                    href="/products"
                    className="text-[10px] uppercase font-bold text-[#FF8C00] hover:underline"
                  >
                    Clear Price Filter
                  </a>
                )}
              </div>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-[var(--color-muted)] font-medium">
                  No products found
                  {sp.maxPrice ? ` under $${sp.maxPrice}` : ""}.
                </p>
                <a
                  href="/products"
                  className="text-xs text-[#FF8C00] underline mt-2 block"
                >
                  View all products
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}