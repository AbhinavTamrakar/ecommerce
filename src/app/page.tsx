import { Product, Category, Banner } from "@/types";
import { HeroSection } from "@/components/layout/HeroSection";
import { BannerStrip } from "@/components/layout/BannerStrip";
import { ProductSlider } from "@/components/product/ProductSlider";
import { CategoryGrid } from "@/components/layout/CategoryGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { PriceSlider } from "@/components/product/PriceSlider";
import { SidebarWrapper } from '@/components/layout/SideBar'
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_API_URL;

function parseList(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (json?.data && Array.isArray(json.data)) return json.data;
  return [];
}

async function getData() {
  try {
    const [productsRes, categoriesRes, bannersRes, typesRes, bestsellersRes] = await Promise.allSettled([
      fetch(`${BASE}/api/public/products`, { cache: "no-store" }),
      fetch(`${BASE}/api/public/categories`, { cache: "no-store" }),
      fetch(`${BASE}/api/public/banners`, { cache: "no-store" }),
      fetch(`${BASE}/api/public/types`, { cache: "no-store" }),
      fetch(`${BASE}/api/public/products?sort=bestseller&per_page=10`, { cache: "no-store" }),
    ]);

    const products =
      productsRes.status === "fulfilled" && productsRes.value.ok
        ? parseList(await productsRes.value.json())
        : [];

    const categories =
      categoriesRes.status === "fulfilled" && categoriesRes.value.ok
        ? parseList(await categoriesRes.value.json())
        : [];

    const banners =
      bannersRes.status === "fulfilled" && bannersRes.value.ok
        ? parseList(await bannersRes.value.json())
        : [];

    const types =
      typesRes.status === "fulfilled" && typesRes.value.ok
        ? parseList(await typesRes.value.json())
        : [];

    let bestsellers: any[] = []
    if (bestsellersRes.status === "fulfilled" && bestsellersRes.value.ok) {
      bestsellers = parseList(await bestsellersRes.value.json())
    }
    if (!bestsellers.length || bestsellers.length === products.length) {
      bestsellers = [...products]
        .sort((a: any, b: any) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0))
        .slice(0, 8)
    }

    return { products, categories, banners, types, bestsellers };
  } catch {
    return { products: [], categories: [], banners: [], types: [], bestsellers: [] };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    maxPrice?: string;
    category?: string;
    type?: string;
  }>;
}) {
  const sp = await searchParams;
  const { products, categories, banners, types, bestsellers } = await getData();

  return (
    <div className="min-h-screen">
      <BannerStrip banners={banners as Banner[]} />
      <HeroSection banners={banners as Banner[]} products={products as Product[]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 items-start">

          <SidebarWrapper>
            <div className="sticky top-[80px]">
              <div className="mb-10 pb-8 border-b border-black/5">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-5">
                  Price Range
                </h3>
                <PriceSlider initialMax={sp.maxPrice} />
              </div>
              <ProductFilters
                categories={categories as Category[]}
                types={types}
                currentParams={sp}
              />
            </div>
          </SidebarWrapper>

          <main className="w-full min-w-0">
            {(categories as Category[]).length > 0 && (
              <section className="mb-16">
                <div className="flex items-end justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    Shop by Category
                  </h2>
                </div>
                <CategoryGrid categories={categories as Category[]} />
              </section>
            )}

            {(bestsellers as Product[]).length > 0 && (
              <section className="pb-16">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-2">Most Popular</p>
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                      Best Sellers
                    </h2>
                  </div>
                  <Link href="/products" className="btn-outline text-sm">View All</Link>
                </div>
                <ProductSlider products={bestsellers as Product[]} />
              </section>
            )}

            <section className="pb-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-2">Curated for you</p>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    Featured Products
                  </h2>
                </div>
                <Link href="/products" className="btn-outline text-sm">View All</Link>
              </div>
              <ProductSlider products={products as Product[]} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}