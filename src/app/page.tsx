import { Product, Category, Banner } from "@/types";
import { HeroSection } from "@/components/layout/HeroSection";
import { ProductSlider } from "@/components/product/ProductSlider";
import { CategoryGrid } from "@/components/layout/CategoryGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { PriceSlider } from "@/components/product/PriceSlider";
import { SidebarWrapper } from '@/components/layout/SideBar'
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_API_URL;

async function getData() {
  try {
    const [productsRes, categoriesRes, bannersRes] = await Promise.allSettled([
      fetch(`${BASE}/api/public/products`, { cache: "no-store" }),
      fetch(`${BASE}/api/public/categories`, { cache: "no-store" }),
      fetch(`${BASE}/api/public/banners`, { cache: "no-store" }),
    ]);

    const products =
      productsRes.status === "fulfilled" && productsRes.value.ok
        ? (await productsRes.value.json()).data ?? []
        : [];

    const categories =
      categoriesRes.status === "fulfilled" && categoriesRes.value.ok
        ? (await categoriesRes.value.json()).data ?? []
        : [];

    const banners =
      bannersRes.status === "fulfilled" && bannersRes.value.ok
        ? (await bannersRes.value.json()).data ?? []
        : [];

    return { products, categories, banners };
  } catch {
    return { products: [], categories: [], banners: [] };
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
  const { products, categories, banners } = await getData();

  return (
    <div className="min-h-screen">

      <HeroSection
        banners={banners as Banner[]}
        products={products as Product[]}
      />

      {/* ── Main content with sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 items-start">

          {/* Sidebar — hidden on mobile via JS */}
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
                currentParams={sp}
              />
            </div>
          </SidebarWrapper>

          {/* Main content */}
          <main className="w-full min-w-0">

            {/* Categories */}
            {(categories as Category[]).length > 0 && (
              <section className="mb-16">
                <div className="flex items-end justify-between mb-8">
                  <h2
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Shop by Category
                  </h2>
                </div>
                <CategoryGrid categories={categories as Category[]} />
              </section>
            )}

            {/* Featured Products */}
            <section className="pb-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-2">
                    Curated for you
                  </p>
                  <h2
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Featured Products
                  </h2>
                </div>
                <Link href="/products" className="btn-outline text-sm">
                  View All
                </Link>
              </div>
              <ProductSlider products={products as Product[]} />
            </section>

          </main>
        </div>
      </div>


    </div>
  );
}